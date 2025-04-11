from fastapi import FastAPI, File, UploadFile, Query, HTTPException, Body, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
import asyncio
import os
import tempfile
import uvicorn
from vector_db.qdrant_wrapper import QdrantWrapper
from llm.qa_system import DocumentQA

app = FastAPI(title="AI API", description="API for vector database operations and LLM interactions")

# Initialize our services
doc_qa = DocumentQA()

class TextItem(BaseModel):
    text: List[str]
    metadata: Optional[List[Dict[str, Any]]] = None
    add_metadata: bool = True
    collection_name: str

class QueryItem(BaseModel):
    text: str
    metadata_filter: Optional[Dict[str, Any]] = None
    limit: int = 50
    use_metadata: bool = True
    collection_name: str

class ChatItem(BaseModel):
    query: str
    model_name: Optional[str] = None

class ChatWithRagItem(BaseModel):
    query: str
    metadata_filter: Optional[Dict[str, Any]] = None
    limit: int = 50
    use_metadata: bool = True    
    model_name: Optional[str] = None
    collection_name: str

class ImageQueryItem(BaseModel):
    image_url: Optional[str] = None
    query: Optional[str] = "Please describe the image."

@app.post("/add_data", response_model=Dict[str, str])
async def add_data(item: TextItem):
    """
    Add data to the Qdrant vector database
    """
    try:
        qdrant = QdrantWrapper(collection_name=item.collection_name)
        qdrant.add_data(
            text=item.text,
            metadata=item.metadata,
            add_metadata=item.add_metadata
        )
        return {"status": "success", "message": f"Added {len(item.text)} documents to {item.collection_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add data: {str(e)}")

@app.post("/query_data")
async def query_data(item: QueryItem):
    """
    Query data from the Qdrant vector database
    """
    try:
        print(f"\n\nquery: {item.text} metadata_filter: {item.metadata_filter} limit: {item.limit} use_metadata: {item.use_metadata} collection_name: {item.collection_name}")
        qdrant = QdrantWrapper(collection_name=item.collection_name)
        results = qdrant.query(
            text=item.text,
            metadata_filter=item.metadata_filter,
            limit=item.limit,
            use_metadata=item.use_metadata
        )

        print(f"\n\nfucking results: {results}")
        
        # Convert results to a serializable format
        # formatted_results = []
        # for res in results:
        #     formatted_results.append({
        #         "id": res.id,
        #         "document": res.document,
        #         "metadata": res.metadata,
        #         "score": res.score
        #     })
            
        # return {"results": formatted_results}
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query data: {str(e)}")

@app.get("/list_models")
async def list_models():
    """
    List available models for chat
    """
    try:
        openai_models = doc_qa.openai_models
        atoma_models = doc_qa.atoma_models
        
        return {
            "openai_models": openai_models,
            "atoma_models": atoma_models
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list models: {str(e)}")

@app.post("/chat")
async def chat_with_model(item: ChatItem):
    """
    Chat with a language model
    """
    try:
        response = await doc_qa.query_llm(
            query=item.query, 
            model_name=item.model_name
        )
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@app.post("/query_image_url")
async def query_image_url(item: ImageQueryItem):
    """
    Query model with an image URL
    """
    try:
        if not item.image_url:
            raise HTTPException(status_code=400, detail="Image URL is required")
            
        response = doc_qa.query_image(
            image_url=item.image_url,
            query=item.query
        )
        return {"description": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image query failed: {str(e)}")

@app.post("/query_image_upload")
async def query_image_upload(
    file: UploadFile = File(...),
    query: str = Form("Please describe the image.")
):
    """
    Query model with an uploaded image
    """
    try:
        # Save the uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            temp_file.write(await file.read())
            temp_file_path = temp_file.name
        
        # Process the image
        try:
            response = doc_qa.query_image(
                image_path=temp_file_path,
                query=query
            )
            
            # Clean up the temporary file
            os.unlink(temp_file_path)
            
            return {"description": response}
        except Exception as e:
            # Clean up in case of error
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            raise e
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload query failed: {str(e)}")

@app.post("/chat_with_rag")
async def chat_with_rag(item: ChatWithRagItem):
    """
    Fetch Data from qdrant and invoke query LLM
    """
    try:
        print(f"\n\nquery: {item.query} metadata_filter: {item.metadata_filter} limit: {item.limit} use_metadata: {item.use_metadata} collection_name: {item.collection_name}")
        
        qdrant = QdrantWrapper(collection_name=item.collection_name)
        results = qdrant.query(
            text=item.query,
            metadata_filter=item.metadata_filter,
            limit=item.limit,
            use_metadata=item.use_metadata
        )

        print(f"\n\nfucking results: {results}")
        results_formatted = [result['text'] for result in results if 'text' in result]
        print(f"\n\nfucking results formatted: {results_formatted}")
        
        prompt=f"Please answer the query based on context. If the context do not have the answer, please say you can't answer the question.\n\nContext: {results_formatted}\n\nQuery: {item.query}"

        print(f"\n\nfucking prompt: {prompt}")
        
        response = await doc_qa.query_llm(
            query=prompt,
            model_name=item.model_name
        )

        return {"response": response}
        # Convert results to a serializable format
        # formatted_results = []
        # for res in results:
        #     formatted_results.append({
        #         "id": res.id,
        #         "document": res.document,
        #         "metadata": res.metadata,
        #         "score": res.score
        #     })
            
        # return {"results": formatted_results}
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query data: {str(e)}")

'''
async def chat_with_rag(self, query: str, model_name='gpt-4o-mini', collection_name="test_collection0") -> str:
        """
        Fetch Data from qdrant and invoke query LLM
        """
        
        qdrant = QdrantWrapper(collection_name=collection_name)
        results = qdrant.query(
            text=query,
            metadata_filter=None,
            limit=50,
            use_metadata=False
        )
'''

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)