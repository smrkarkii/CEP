import os
from typing import List, Dict, Union, Optional, Any
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, Filter, FieldCondition, MatchValue

class QdrantWrapper:
    """
    A wrapper class for the Qdrant vector database client with simplified methods
    for embedding storage and retrieval.
    """
    
    def __init__(self, collection_name: str="test_collection0", vector_size: int = 1536, distance: Distance = Distance.DOT):
        """
        Initialize the QdrantWrapper with a specified collection name.
        Creates the collection if it doesn't exist.
        
        Args:
            collection_name: Name of the collection to use
            vector_size: Size of the embedding vectors (default: 1536 for OpenAI embeddings)
            distance: Distance metric to use (default: COSINE)
        """
        # Load environment variables
        load_dotenv()
        
        # Initialize the client
        self.client = QdrantClient(
            url=os.getenv("QDRANT_URL"), 
            api_key=os.getenv("QDRANT_API_KEY"),
        )

        self.chunk_size = int(os.getenv("CHUNK_SIZE", 10000))
        self.overlap = int(os.getenv("OVERLAP", 10000))
        
        self.collection_name = collection_name
        self.vector_size = vector_size
        
        # Commented part is giving error (run 3_claude.py to see the error.)
        # # Create collection if it doesn't exist
        # if not self.client.collection_exists(collection_name):
        #     self.client.create_collection(
        #         collection_name=collection_name,
        #         vectors_config=VectorParams(
        #             size=vector_size, 
        #             distance=distance
        #         ),
        #     )
    # both text and metadata are lists of same length

    def split_long_text(self, texts, metadatas):
        texts_new = []
        metadatas_new = []
        for text, metadata in zip(texts, metadatas):
            if len(text) > self.chunk_size:
                start = 0
                while start < len(text):
                    end = start + self.chunk_size
                    texts_new.append(text[start:end])
                    metadatas_new.append(metadata)
                    start += self.chunk_size - self.overlap
            else:
                texts_new.append(text)
                metadatas_new.append(metadata)
        return texts_new, metadatas_new

    def add_data(self, text: Union[str, List[str]], metadata: Optional[Union[Dict, List[Dict]]] = None, add_metadata=False) -> List:
        """
        Add text data to the Qdrant collection with optional metadata.
        
        Args:
            text: Single string or list of strings to add
            metadata: Optional metadata dict or list of dicts, one per text item
            add_metadata: Whether to add metadata to the documents
            
        Returns:
            List of IDs for the added items
        """
        # Handle single text and metadata as well as lists
        if isinstance(text, str):
            text = [text]
        
        if not add_metadata:
            self.client.add(
                collection_name=self.collection_name
                # documents=text,
            )
        else:
            if metadata is None:
                metadata = [{}] * len(text)
            elif isinstance(metadata, dict):
                metadata = [metadata]
                
            if len(text) != len(metadata):
                raise ValueError("Number of text items must match number of metadata items")
            print(f"\n\nAdding text :{text} \n metadata : {metadata} \n collection_name :{self.collection_name}\n")
            
            texts, metadatas = self.split_long_text(text, metadata)
            print(f"\n\nSplitted text :{texts} \n metadata : {metadatas} \n collection_name :{self.collection_name}\n")
            # Add document with metadata
            # Using client.add which handles embedding internally
            result = self.client.add(
                collection_name=self.collection_name,
                documents=texts,
                metadata=metadatas
            )
            
            return result
    
    def query(self, text: str, metadata_filter: Optional[Dict] = None, limit: int = 5, use_metadata=False) -> List[Dict]:
        """
        Query the Qdrant collection for documents matching the query text and optional metadata filter.
        
        Args:
            text: Query text
            metadata_filter: Optional metadata to filter results (e.g., {"source": "some_source"})
            limit: Maximum number of results to return
            
        Returns:
            List of dictionaries containing matches with text and metadata
        """
        if use_metadata:
            # Prepare filter if metadata is provided
            query_filter = None
            if metadata_filter:
                conditions = []
                for key, value in metadata_filter.items():
                    conditions.append(
                        FieldCondition(
                            key=key,
                            match=MatchValue(value=value)
                        )
                    )
                
                if conditions:
                    query_filter = Filter(must=conditions)
            
            # Query the collection
            search_results = self.client.query(
                collection_name=self.collection_name,
                query_text=text,
                query_filter=query_filter,
                limit=limit
            )
            
            # Format results
            results = []
            for item in search_results:
                result = {
                    "text": item.document,
                    "metadata": item.metadata,
                    "score": item.score
                }
                results.append(result)
                
            return results
        else:
            # Query the collection
            search_results = self.client.query(
                collection_name=self.collection_name,
                query_text=text,
                limit=limit
            )
            '''
            Example search_results
            [QueryResponse(id='f94156eb-9570-4e69-80bd-20248d6b39d2', embedding=None, sparse_embedding=None, metadata={'document': 'Another example text'}, document='Another example text', score=0.9478686), QueryResponse(id='0f2a3c3e-e49a-4684-a18a-edbeee8583e7', embedding=None, sparse_embedding=None, metadata={'document': 'This is a sample document'}, document='This is a sample document', score=0.8736136)]
            '''

            return search_results
                
    def delete_by_metadata(self, metadata_filter: Dict) -> bool:
        """
        Delete points from the collection based on metadata filter.
        
        Args:
            metadata_filter: Metadata to filter points to delete
            
        Returns:
            True if operation was successful
        """
        conditions = []
        for key, value in metadata_filter.items():
            conditions.append(
                FieldCondition(
                    key=key,
                    match=MatchValue(value=value)
                )
            )
        
        if conditions:
            delete_filter = Filter(must=conditions)
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=delete_filter
            )
            return True
        
        return False
    
    def get_collection_info(self) -> Dict:
        """
        Get information about the collection.
        
        Returns:
            Dictionary with collection information
        """
        return self.client.get_collection(self.collection_name).dict()
    
    def count_documents(self, metadata_filter: Optional[Dict] = None) -> int:
        """
        Count documents in the collection, optionally filtered by metadata.
        
        Args:
            metadata_filter: Optional metadata to filter results
            
        Returns:
            Number of documents
        """
        query_filter = None
        if metadata_filter:
            conditions = []
            for key, value in metadata_filter.items():
                conditions.append(
                    FieldCondition(
                        key=key,
                        match=MatchValue(value=value)
                    )
                )
            
            if conditions:
                query_filter = Filter(must=conditions)
        
        return self.client.count(
            collection_name=self.collection_name,
            count_filter=query_filter
        ).count

if __name__ == "__main__":
    # Initialize the wrapper
    qdrant = QdrantWrapper(collection_name="****ing_collection2")

    # Add data
    qdrant.add_data(
        text=["This is a ****ing sample document", "Another ****ing example text"],
        metadata=[{"source": "book1"}, {"source": "website"}],
        add_metadata=True # Can set to true/False
    )

    # Query data
    results = qdrant.query(
        text="example", 
        metadata_filter={"source": "website"},
        limit=50,
        use_metadata=True
    )

    print(f"****ing Results: {results}")
    '''
        Example search_results
        [QueryResponse(id='f94156eb-9570-4e69-80bd-20248d6b39d2', embedding=None, sparse_embedding=None, metadata={'document': 'Another example text'}, document='Another example text', score=0.9478686), QueryResponse(id='0f2a3c3e-e49a-4684-a18a-edbeee8583e7', embedding=None, sparse_embedding=None, metadata={'document': 'This is a sample document'}, document='This is a sample document', score=0.8736136)]
    '''
    
    # todo. count does not work (we may not need it)
    # # Count documents
    # count = qdrant.count_documents(metadata_filter={"source": "book1"})
    # print(f"Count: {count}")