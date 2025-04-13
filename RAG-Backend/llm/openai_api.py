import requests
import base64

from dotenv import load_dotenv
import os
load_dotenv()

from openai import OpenAI, AsyncOpenAI, models

class OpenaiAPI:
    def __init__(self):
         # Set OpenAI api token
        openai_api_key = os.environ.get('OPENAI_API_KEY')
        assert openai_api_key !=None, "openai api key not found"
        
        self.openai_client = OpenAI(api_key=openai_api_key)
        self.openai_client_async = AsyncOpenAI(api_key=openai_api_key)
        
        print('Initializing models list...', end='')
        self.models_list = self.get_models_list()
        print('done.')

    def get_models_list(self):
        models_list = []
        
        try:
            res = models.list()
            for model in res.data:
                    models_list.append(model.id)
        except Exception as ex:
            print(ex)
        
        return models_list

    
    def query_openai(self, query, model_name):
        try:
            print(f'one of gpt models. using {model_name} model')
            completion = self.openai_client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {
                        "role": "user",
                        "content": query
                    }
                ]
            )
            # print(completion.choices[0].message.content)
            return completion.choices[0].message.content
        except requests.RequestException as e:
            return f"Error: {str(e)}"
    
    def get_image_description_from_url(self, image_url, query, model_name):
        '''
        * image reference: https://platform.openai.com/docs/guides/images?api-mode=responses&format=base64-encoded
        '''
        try:
            print(f'generating image response from url.')
            response = self.openai_client.responses.create(
                model=model_name,
                input=[{
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": query},
                        {
                            "type": "input_image",
                            "image_url": image_url,
                        },
                    ],
                }],
            )
            return response.output_text
        except Exception as e:
            return f"Error: {str(e)}"
    
    def get_image_description_from_path(self, image_path, query, model_name):
        '''
        * image reference: https://platform.openai.com/docs/guides/images?api-mode=responses&format=base64-encoded
        '''
        try:
            print(f'generating image response from path.')
            # Function to encode the image
            def encode_image(image_path):
                with open(image_path, "rb") as image_file:
                    return base64.b64encode(image_file.read()).decode("utf-8")

            # Getting the Base64 string
            base64_image = encode_image(image_path)


            response = self.openai_client.responses.create(
                model=model_name,
                input=[
                    {
                        "role": "user",
                        "content": [
                            { "type": "input_text", "text": query },
                            {
                                "type": "input_image",
                                "image_url": f"data:image/jpeg;base64,{base64_image}",
                            },
                        ],
                    }
                ],
            )
            return response.output_text
        except Exception as e:
            return f"Error: {str(e)}"
    
    async def query_openai_async(self, query, model_name, max_tokens=None):
        try:
            print(f'one of gpt models. using {model_name} model')
            completion = await self.openai_client_async.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {
                        "role": "user",
                        "content": query
                    }
                ]
            )
            # print(completion.choices[0].message.content)
            return completion.choices[0].message.content
        except Exception as e:
            print(f'Error in query_openai: {e}')
            return f"Error: {str(e)}"

if __name__ == "__main__":
    # Test if above class works as expected
    
    openai_api = OpenaiAPI()
    
    # list models
    print(f'models list: {openai_api.models_list}')
    
    # normal request
    response = openai_api.query_openai_async('hi!','gpt-4-0613')
    print(f'normal response for query hi!: {response}')

    # Async function
    import asyncio
    response = asyncio.run(openai_api.query_openai_async('hi','gpt-4-0613'))
    print(f'async response for query hi!: {response}')
    