from fastapi import FastAPI, File, UploadFile, Query, HTTPException, Body, Form, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
import asyncio
import os
import tempfile
import uvicorn
from vector_db.qdrant_wrapper import QdrantWrapper
from llm.qa_system import DocumentQA
import json

app = FastAPI(title="AI API", description="API for vector database operations and LLM interactions")

# Cross Origin Reference
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify exact origins like ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class ChatWithImageRagItem(BaseModel):
    query: str
    metadata_filter: Optional[Dict[str, Any]] = None
    limit: int = 50
    use_metadata: bool = True
    model_name: Optional[str] = None
    collection_name: str

class TextItem(BaseModel):
    text: List[str]
    metadata: Optional[List[Dict[str, Any]]] = None
    add_metadata: bool = True
    collection_name: str


# For handling form data with lists and dictionaries
async def parse_add_data_form(
    text: str = Form(...),
    metadata: Optional[str] = Form(None),
    add_metadata: bool = Form(True),
    collection_name: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    """Parse form data for the add_data endpoint"""
    # Parse text from JSON string
    try:
        text_list = json.loads(text)
        if not isinstance(text_list, list):
            text_list = [text_list]  # Handle single string case
    except json.JSONDecodeError:
        # If not valid JSON, treat as a single string
        text_list = [text]
    
    # Parse metadata from JSON string if provided
    metadata_list = None
    if metadata:
        try:
            metadata_list = json.loads(metadata)
            if not isinstance(metadata_list, list):
                metadata_list = [metadata_list]  # Handle single dict case
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON format for metadata")
    
    return {
        "text_list": text_list,
        "metadata_list": metadata_list,
        "add_metadata": add_metadata,
        "collection_name": collection_name,
        "file": file
    }

@app.post("/add_data_with_image")
async def add_data_with_image(form_data: dict = Depends(parse_add_data_form)):
    """
    Add text and <optional> Image data to the Qdrant vector database with optional image description
    
    This endpoint:
    1. Optionally processes an uploaded image to generate a description
    2. Adds the image description to each text entry if requested
    3. Stores the combined text in the vector database
    """
    try:
        text_list = form_data["text_list"]
        metadata_list = form_data["metadata_list"]
        add_metadata = form_data["add_metadata"]
        collection_name = form_data["collection_name"]
        file = form_data["file"]
        
        # Process image if provided
        image_description = None
        if file:
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1] if file.filename else '.jpg') as temp_file:
                temp_file.write(await file.read())
                temp_file_path = temp_file.name
            
            try:
                image_description = doc_qa.query_image(
                    image_path=temp_file_path,
                    query="Please describe this image in detail."
                )
                # Clean up the temporary file
                os.unlink(temp_file_path)
            except Exception as e:
                # Clean up in case of error
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")
        
        # If we have an image description, add it to each text entry
        if image_description:
            enhanced_text_list = []
            for text_item in text_list:
                enhanced_text = f"{text_item}\n\nImage Description: {image_description}"
                enhanced_text_list.append(enhanced_text)
            
            # Replace the original text list with the enhanced one
            text_list = enhanced_text_list
            
            # If metadata exists, add image info to it
            if metadata_list:
                for metadata_item in metadata_list:
                    metadata_item["contains_image_description"] = True
                    metadata_item["image_processed"] = True
            else:
                # Create metadata if it doesn't exist
                metadata_list = [{"contains_image_description": True, "image_processed": True} for _ in text_list]
        
        # Add to vector database
        qdrant = QdrantWrapper(collection_name=collection_name)

        print(f"\n\nAdding {len(text_list)} documents to {collection_name} \n e.g. {text_list[0]}\n")
        qdrant.add_data(
            text=text_list,
            metadata=metadata_list,
            add_metadata=add_metadata
        )
        
        return {
            "status": "success", 
            "message": f"Added {len(text_list)} documents to {collection_name}",
            "image_processed": image_description is not None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add data: {str(e)}")


@app.post("/chat_with_image_rag")
async def chat_with_image_rag(
    query: str = Form(...),
    collection_name: str = Form(...),
    metadata_filter: Optional[str] = Form(None),
    limit: int = Form(50),
    use_metadata: bool = Form(True),
    model_name: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Chat with image and RAG endpoint that:
    1. Fetches relevant documents from vector database
    2. If image is provided, generates description of the image
    3. Combines both sources of information in a prompt
    4. Performs inference with an LLM
    """
    try:
        # Parse metadata_filter from string to dict if provided
        metadata_filter_dict = None
        if metadata_filter:
            try:
                import json
                metadata_filter_dict = json.loads(metadata_filter)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid JSON format for metadata_filter")
        
        # Step 1: Fetch relevant documents from vector database
        qdrant = QdrantWrapper(collection_name=collection_name)
        results = qdrant.query(
            text=query,
            metadata_filter=metadata_filter_dict,
            limit=limit,
            use_metadata=use_metadata
        )
        
        # Format the RAG results
        if isinstance(results[0], dict) and 'text' in results[0]:
            # Handle case where results are already dicts with 'text' field
            results_formatted = [result['text'] for result in results if 'text' in result]
        else:
            # Handle case where results are objects with 'document' attribute
            results_formatted = [result.document for result in results if hasattr(result, 'document')]
        
        print(f"\n\nRAG results: {results_formatted}")

        # Step 2: Process image if provided
        image_description = None
        if file:
            print(f'\n\nImage file: {file}')
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1] if file.filename else '.jpg') as temp_file:
                temp_file.write(await file.read())
                temp_file_path = temp_file.name
            
            try:
                image_description = doc_qa.query_image(
                    image_path=temp_file_path,
                    query="Please describe this image in detail."
                )
                # Clean up the temporary file
                os.unlink(temp_file_path)
            except Exception as e:
                # Clean up in case of error
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")
        
        # Step 3: Construct the prompt
        prompt = "Please answer the query based on the following context. If the context does not contain the answer, please say you can't answer the question.\n\n"
        
        # Add document context
        if results_formatted:
            prompt += f"## Document Context:\n {results_formatted}\n\n"
        
        # Add image context if available
        if image_description:
            prompt += f"## Image Description:\n Below is the description of image given by user: \n {image_description}\n\n"
        
        # Add the user query
        prompt += f"## Query: \n {query}\n\n"

        print(f"\n\nPrompt: {prompt}")
        
        # Step 4: Perform inference with LLM
        response = await doc_qa.query_llm(
            query=prompt,
            model_name=model_name
        )
        
        return {
            "response": response,
            "context_used": {
                "documents_retrieved": len(results_formatted),
                "image_processed": image_description is not None
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat with image and RAG failed: {str(e)}")

@app.post("/add_data", response_model=Dict[str, str])
async def add_data(item: TextItem):
    """
    Ignore this endpoint: This is vestige of old plan.
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
    Ignore this endpoint: This is vestige of old plan.
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

        print(f"\n\n****ing results: {results}")
        
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
    Ignore this endpoint: This is vestige of old plan.
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
    Ignore this endpoint: This is vestige of old plan.
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
    Ignore this endpoint: This is vestige of old plan.
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
    Ignore this endpoint: This is vestige of old plan.
    Fetch Data from Qdrant and invoke query LLM
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

        print(f"\n\n****ing results: {results}")
        results_formatted = [result['text'] for result in results if 'text' in result]
        print(f"\n\n****ing results formatted: {results_formatted}")
        
        prompt=f"Please answer the query based on context. If the context do not have the answer, please say you can't answer the question.\n\nContext: {results_formatted}\n\nQuery: {item.query}"

        print(f"\n\n****ing prompt: {prompt}")
        
        response = await doc_qa.query_llm(
            query=prompt,
            model_name=item.model_name
        )

        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query data: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)