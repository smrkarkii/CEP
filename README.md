
---

# FastAPI Backend for RAG System

This repository contains the FastAPI backend powering a Retrieval-Augmented Generation (RAG) system.

## 🚀 Getting Started

### 1. Setup Environment
- Rename `.env_example` to `.env` and fill in your API keys.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Server
```bash
uvicorn main:app --reload
# or
python3 main.py
```

### 4. Access API Docs
Once the server is running, navigate to:

👉 [http://localhost:8000/docs](http://localhost:8000/docs)

to explore the interactive Swagger UI documentation.

---

## Potentially-Ambiguous API parameters
- `collection_name`: `str`
 - it is name of collection to store data to
 - could be any string, just remember to use the same string while adding data and fetching data

- `metadata`: `dict`
  - it is metadata to store with data
  - could be any dictionary, just remember to use the same dictionary while adding data and fetching data

  - e.g. we can give the creators information while adding information and filter from anomg entries with matching creators metadata
  - e.g. give metadata: `{"author": "Anon", "date": "2025-04-12"}` while adding data and you can filter by same metadata while querying llm

 - Avoid Checking `Send empty value` checkmark from fastapi `/docs`, if you are giving no image file as input because checking it gives string value but backend expects File. This is the actual error string: "Value error, Expected UploadFile, received: <class 'str'>"

## 📚 References

- [Qdrant Python Client Documentation](https://python-client.qdrant.tech/)
- [OpenAI Image & Vision Guide](https://platform.openai.com/docs/guides/images?api-mode=responses&format=url)
- [Atoma SDK for Python](https://github.com/atoma-network/atoma-sdk-python)

---

Happy coding! ✨

---
