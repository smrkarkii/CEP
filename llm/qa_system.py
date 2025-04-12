import json
from typing import List, Dict

from typing import Union, List

from dotenv import load_dotenv
load_dotenv()





from .atoma_api import AtomaAPI
from .openai_api import OpenaiAPI

class DocumentQA:
    _instance: "DocumentQA" = None
    
    def __init__(self, chunk_size: int = 10_000, overlap: int = 100):
        
        # initialize openai api
        self.openai_api = OpenaiAPI()
        
        # initialize atoma api
        self.atoma_api = AtomaAPI()

        self.atoma_models = self.atoma_api.models_list
        self.openai_models = self.openai_api.models_list
        
        # Parameters for splitting documents
        self.chunk_size = chunk_size
        self.overlap = overlap
    
    def query_image(self, image_path=None, image_url=None, query="Please describe the image.", model_name="gpt-4o-mini"):
        if not image_path and not image_url:
            raise ValueError("Please provide either image_path or image_url")
        
        if image_path:
            response = self.openai_api.get_image_description_from_path(image_path, query, model_name)
            return response
        else:
            response = self.openai_api.get_image_description_from_url(image_url, query, model_name)
            return response

    # gpt-4o-mini is cheap model so using it as default.
    async def query_llm(self, query: str, max_tokens = None, model_name='gpt-4o-mini') -> str:
        """
        Send a query to the LLM API and return the response
        
        * model name is one of these values: "o1", "r1", "llama3-70B"
        """
        # with open('prompt.txt','a') as f:
        #     f.write(f'\n\n<new-prompt>: {str(purpose)}\n'+query)

        # print(f'query: {query}')
        # query using deepseek r1 model
        #-------------------------------
        if model_name in self.openai_api.models_list:
            response = await self.openai_api.query_openai_async(query=query, model_name=model_name)
            return response
        
        elif model_name in self.atoma_api.models_list:
            response = await self.atoma_api.query_atoma_async(query=query, model_name=model_name, max_tokens=max_tokens)
            return response
        else:
            print(f'Cant recognize model: {model_name}. Using Default model:gpt-4o model')
            response = await self.openai_api.query_openai_async(query=query, model_name='gpt-4o-mini', max_tokens=max_tokens)
            return response
    
    def generate_questions(self, text: str, model_name='gpt-4o-mini') -> List[str]:
        """
        Generate questions from text
        """
        prompt = f"""Please generate questions based on the following text: \n\n{text} \n\n"""
        return self.query_llm(query=prompt, max_tokens = None, model_name = model_name)
    def generate_summary(self, text: str, model_name='gpt-4o-mini') -> str:
        """
        Generate summary from text
        """
        prompt = f"""Please generate a summary based on the following text: \n\n{text} \n\n"""
        return self.query_llm(query=prompt, max_tokens = None, model_name = model_name)
        
    def split_document(self, document: Dict) -> List[Dict]:
        """
        Split document into overlapping chunks
        
        # Example format for return type:
        [
        {
            'source': 'source1',
            'url': 'url1',
            'text_content': 'text_content1',
            'chunk_index': 0
        }, 
        {
            'source': 'source1',
            'url': 'url1',
            'text_content': 'text_content1',
            'chunk_index': 1
        }, ...
        ]
        """
        
        text = document['text_content']
        chunks = []
        start = 0
        while start < len(document['text_content']):
            end = start + self.chunk_size
            chunk = {
                'source': document['source'],
                'url': document['url'],
                'text_content': text[start:end],
                'chunk_index': len(chunks)
            }
            chunks.append(chunk)
            start += self.chunk_size - self.overlap
        return chunks

    async def save_documents(self, documents: List[Dict]) -> None:
        """
        Split documents into chunks and save to MongoDB
        """
        all_chunks = []
        for doc in documents:
            chunks = self.split_document(doc)
            chunk_models = [DataCollection(**chunk) for chunk in chunks]
            all_chunks.extend(chunk_models)
            
        if all_chunks:
            await DataCollection.insert_many(all_chunks)

    async def search_documents(self, query:str, source: str, n: int = 10, full_text_search=False) -> List[Dict]:
        """
        * full text search on `text_content` to perform Search for most relevant documents from a specific source
        
        * this is previous version that just finds n documents from given document.
        cursor = self.mongo.collection.find(
                {'source': source},
                {'text_content': 1, 'url': 1, '_id': 0}
            ).limit(n)
        """
        if full_text_search:
            print(f'full text search')
            # consumes more time
            # Create the query object without awaiting it
            # Define your query
            # Get the direct motor collection
            # Define your query
            filter_query = {
                'source': source,
                '$text': {'$search': query}
            }

            # Define your projection
            projection = {
                'text_content': 1, 
                'url': 1, 
                '_id': 0,
                'score': {'$meta': "textScore"}
            }
            collection = DataCollection.get_motor_collection()

            # Use the motor collection directly
            cursor = collection.find(
                filter_query,
                projection=projection
            ).sort([('score', {'$meta': "textScore"})]
            ).limit(n)

            # Now await the execution of the query
            result = await cursor.to_list(length=n)
            # print(f'search results: {result}')
        else:
            cursor = DataCollection.find(
                {'source': source},
                {'text_content': 1, 'url': 1, '_id': 0}
            ).limit(n)
            result = await cursor.to_list(length=n)

        # print(f'source:{source} exists:{DataCollection.exists(source)} result: {result}')
        return result

    async def query_documents(self, query: str, source: str, n_docs: int = 100, bullet_points:bool = False, feed_message_history:bool=False, feed_lean_canvas_summary={}, brainstorm=False, model_name='gpt-4o', full_text_search=False, include_documents=True, previous_questions=[], generate_questions=False, update_summaries=False, purpose=None) -> Union[str, List[int]]:
        """
        * Added for brainstorming (False by default)
        * Complete pipeline: search documents and query LLM with context
        """

        # Get relevant documents
        context = ""
        if include_documents:
            relevant_docs = await self.search_documents(query=query, source=source, n=n_docs, full_text_search=full_text_search)
            # print(f'relevant_docs: {relevant_docs}')
            # Prepare context from relevant documents
            context = "\n\n".join([doc['text_content'] for doc in relevant_docs])
        
        if brainstorm:
            # brainstorm prompt for chat interface
            prompt = get_brainstorm_prompt(source, context)

        elif bullet_points:
            # bullet points for lean canvas
            prompt = f"""please give very short response (not more than few sentences) You are a research-focused chatbot engaging in a conversation with a human. \n\n Your task is to provide professional and detailed answers to questions based strictly on the given context and messages history related to {source}.\n\n If the context or message history does not contain sufficient information to answer the question, clearly inform the user with very short message. Feel free to use the information user has provided in previous chat for answering new questions. Please answers in short bullet points which we can put in bullet points. Please respond with very short one sentence response if Question is actually suggestion or additional information. \n\nBelow is the context: \n\n## Context: \n\n{context} \n\n"""
        elif generate_questions:
            prompt = get_questions_list_prompt(source, context, previous_questions) + f"\n\nBelow is the context: \n\nContext: \n\n{context} \n\n"
        elif update_summaries:
            prompt = '''## output\n* please generate a new summary in json format and please avoid generating any other text than updated json summary\n* Also, lets not assume things, please generate output based on given data (previous lean canvas) or conversations or given additional data.\n### example output1\n```\n{\n    "overall": "AI-powered test case generation platform for software QA and compliance testing automation.",\n    "target_users": "* Software development teams needing accelerated QA cycles\n* Enterprises with complex compliance requirements (e.g., finance, healthcare)\n* \n* DevOps teams using CI/CD pipelines\n* QA departments in mid-large tech companies",\n    "problems": "* Manual test case creation is time-consuming and error-prone\n* QA bottlenecks delaying software release cycles\n* High costs of compliance testing in regulated industries\n* Difficulty scaling QA processes for agile development",\n    "solutions": "Proprietary AI that analyzes code/requirements to auto-generate test cases\n* CI/CD pipeline integration for continuous testing\n* Adaptive compliance testing for software-behavior-based regulations\n* 10x faster test coverage than manual creation",\n    "unfair_advantage": "Founding team combines QA domain expertise + AI/ML technical depth\n* Proprietary test generation algorithms (patent-pending?)\n* First-mover advantage in AI-native compliance testing integration\n* Existing integrations with industry-standard CI/CD tools",\n    "unique_value_proposition": "Ship faster with AI-generated test suites that keep pace with development\n* Replace 80% of manual test design work with reliable automation\n* Compliance-as-code testing for regulated industries\n* Self-improving test coverage through ML feedback loops",\n    "channels": "Enterprise sales to DevOps/QA leadership\n* Partnerships with CI/CD platform providers\n* Developer community adoption through GitHub/GitLab integrations\n* Industry-specific compliance conferences (FINOS, HIMSS)",\n    "costs": "AI model training/maintenance infrastructure\n* Cloud compute costs for test generation engine\n* Enterprise sales team compensation\n* Compliance certification maintenance",\n    "revenue": "SaaS pricing based on test cases generated/month\n* Enterprise tier with custom compliance modules\n* Revenue share from CI/CD platform marketplace\n* Professional services for implementation/training"\n}\n```\n        ''' + f"\n\nBelow is the context: \n\nContext: \n\n{context} \n\n"
            
        else:
            # Prepare prompt with context and query
            prompt = f"""\n You are a research-focused chatbot engaging in a conversation with a human. \n\n Your task is to provide professional and detailed answers to questions based on the given context and messages history related to {source}.\n\n If the context or message history does not contain sufficient information to answer the question, clearly inform the user with very short message. Feel free to use the information user has provided in previous chat for answering new questions.\n\n Below is the context: Please respond with very short one sentence response if Question is actually suggestion or additional information. \n\nContext: \n\n{context} \n\n"""
        
        if feed_lean_canvas_summary:
            lean_canvas_summary_str = ''
            async def _get_lean_canvas_summary(source):
                """
                Retrieve all messages for a given source.
                Can be used as part of another API call.
                """
                try:
                    source_info = await SourceInfoCollection.find_one({"source": source})
                    if not source_info:
                        return None  # Return None instead of JSON response when used internally
                    
                    return source_info.to_json  # Return messages as a dictionary
                except Exception as e:
                    logger.error(f'Error fetching lean canvas: {e}')
            
            lean_canvas_summary = await _get_lean_canvas_summary(source)
            if lean_canvas_summary and 'summaries' in lean_canvas_summary:
                for key, value in lean_canvas_summary['summaries'].items():
                    lean_canvas_summary_str += f'\n### {key}: \n ' + value
                prompt += "\n\n## Previous lean canvas:\n\n" + lean_canvas_summary_str
        
        if feed_message_history:
            
            formatted_messages = ''
            async def _get_messages(source):
                """
                Retrieve all messages for a given source.
                Can be used as part of another API call.
                """
                try:
                    source_messages = await MessageCollection.find_one({"source": source})
                    if not source_messages:
                        return None  # Return None instead of JSON response when used internally
                    
                    return source_messages.to_json  # Return messages as a dictionary
                except Exception as e:
                    logger.error(f'Error fetching messages: {e}')
            
            messages = await _get_messages(source)
            # print(f'\n\n got messages: {messages}\n\n')
            if messages and 'messages' in messages:
                for message in messages['messages']:
                    # print(f'query: {message["query"]}\n response: {message["response"]} \n\n')
                    formatted_messages += f'''user: {message['query']} \nassistant: {message['response']} \n'''
                
                prompt += "\n\n## previous Messages: \n\n" + formatted_messages
        
        # Add query to the prompt
        prompt += f"\n\n## New message:\n\nuser: {query}"
        
        response = await self.query_llm(prompt, model_name=model_name, purpose=purpose)
        if generate_questions:
            def extract_backtick_content(text):
                # This pattern matches content between triple backticks
                # It handles both with and without language identifiers (like ```json)
                pattern = r'```(?:\w+)?\s*\n?([\s\S]*?)\n?```'
                
                # Find all matches
                matches = re.findall(pattern, text)
                
                return matches

            print(f'\n\n The response: {response}')
            extracted_content = extract_backtick_content(response)
            if extracted_content:
                try:
                    questions_list = json.loads(extracted_content[0])
                    print(f"\nextracted questions list: {questions_list}")
                    return questions_list
                except json.JSONDecodeError as e:
                    print(f'\n\n error document_qa.py parse questions: {e} \n\n got_questions: {extracted_content}')
                    return []
        else:
            # Get LLM response
            return response
    

if __name__ == "__main__":
    # Example Usage
    import asyncio
    
    # Test query llm
    response =  asyncio.run(qa_system.query_llm("hi"))
    print(response)