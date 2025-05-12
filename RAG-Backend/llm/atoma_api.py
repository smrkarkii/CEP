import requests

from dotenv import load_dotenv
import os
load_dotenv()

from atoma_sdk import AtomaSDK

class AtomaAPI:
    def __init__(self):
        # Set atoma api token
        atoma_api_token = os.environ.get('ATOMA_BEARER')
        assert atoma_api_token !=None, "No atoma bearer found in .env"
        self.atoma_api_token = atoma_api_token

        print('Initializing models list...', end='')
        self.models_list = self.get_models_list()
        print('done.')
    
    def get_models_list(self):
        atoma_models = []
        try:
            with AtomaSDK(
                bearer_auth=self.atoma_api_token,
            ) as atoma_sdk:
                res = atoma_sdk.models_.models_list()
                # Handle response
                # print(res)
                for model in res.data:
                    atoma_models.append(model.id)
                return atoma_models
                # print(atoma_models)
        except Exception as ex:
            print(ex)
            return []

    async def query_atoma_async(self, query, model_name, max_tokens=None, exclude_thinking_text=True):
        try:
            async with AtomaSDK(  # Use async with
                bearer_auth=self.atoma_api_token,
            ) as atoma_sdk:
                res = await atoma_sdk.chat.create_async(  # Use create_async and await
                    messages=[
                        {
                            "content": query,
                            "role": "user",
                        },
                    ],
                    model=model_name,
                    frequency_penalty=0,
                    max_tokens=max_tokens,
                    n=1,
                    presence_penalty=0,
                    seed=123,
                    stop=[
                        "json([\"stop\", \"halt\"])",
                    ],
                    temperature=0.7,
                    top_p=1,
                    user="user-1234"
                )

                # deepseek r1 have option to include thinking text
                if 'r1' in model_name and exclude_thinking_text:
                    # Remove thinking text from r1 model
                    return res.choices[0].message.content.split('</think>')[-1].strip()

                # llm response without any modifications.
                return res.choices[0].message.content
        except Exception as ex:
            print(f' error query llm: {ex}')
            return f"error query llm: {ex}"

    def query_atoma(self, query, model_name, max_tokens=None, exclude_thinking_text=True):
        try:
            with AtomaSDK(
                bearer_auth=self.atoma_api_token,
            ) as atoma_sdk:
                res = atoma_sdk.chat.create(messages=[
                    {
                        "content": query,
                        "role": "user",
                    },
                ], model=model_name, frequency_penalty=0, max_tokens=max_tokens, n=1, presence_penalty=0, seed=123, stop=[
                    "json([\"stop\", \"halt\"])",
                ], temperature=0.7, top_p=1, user="user-1234")
                
                # deepseek r1 have option to include thinking text
                if 'r1' in model_name and not exclude_thinking_text:
                    # Remove thinking text from r1 model
                    return res.choices[0].message.content.split('</think>')[-1].strip()
                
                # llm response without any modifications.
                return res.choices[0].message.content
        except Exception as ex:
            print(f' error query llm: {ex}')
            return f"error query llm: {ex}"


if __name__ == "__main__":
    # Test if above class works as expected
    
    atoma_api = AtomaAPI()
    
    # list models
    print(f'models list: {atoma_api.models_list}')
    
    # normal request
    response = atoma_api.query_atoma('hi!','neuralmagic/DeepSeek-R1-Distill-Llama-70B-FP8-dynamic')
    print(f'normal response for query hi!: {response}')

    # Async function
    import asyncio
    response = asyncio.run(atoma_api.query_atoma_async('hi','neuralmagic/DeepSeek-R1-Distill-Llama-70B-FP8-dynamic'))
    print(f'async response for query hi!: {response}')
    