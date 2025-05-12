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
        vestige of old plan.
        Generate questions from text
        """
        prompt = f"""Please generate questions based on the following text: \n\n{text} \n\n"""
        return self.query_llm(query=prompt, max_tokens = None, model_name = model_name)
    def generate_summary(self, text: str, model_name='gpt-4o-mini') -> str:
        """
        vestige of old plan.
        Generate summary from text
        """
        prompt = f"""Please generate a summary based on the following text: \n\n{text} \n\n"""
        return self.query_llm(query=prompt, max_tokens = None, model_name = model_name)
        
if __name__ == "__main__":
    # Example Usage
    import asyncio
    
    # Test query llm
    response =  asyncio.run(qa_system.query_llm("hi"))
    print(response)