import os
# Gemini RAG Backend Initialized
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
from chromadb.utils import embedding_functions
import google.generativeai as genai
from dotenv import load_dotenv
import tiktoken

load_dotenv()

app = FastAPI()

# CORS setup for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ChromaDB (In-memory)
chroma_client = chromadb.Client()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    
    # Custom Gemini Embedding Function for Chroma
    class GeminiEmbeddingFunction(embedding_functions.EmbeddingFunction):
        def __call__(self, input: List[str]) -> List[List[float]]:
            model = "models/text-embedding-004"
            result = genai.embed_content(model=model, content=input, task_type="retrieval_document")
            return result["embedding"]

    gemini_ef = GeminiEmbeddingFunction()
    collection = chroma_client.get_or_create_collection(
        name="knowledge_base", 
        embedding_function=gemini_ef
    )
    # LLM Model Initialization
    llm_model = genai.GenerativeModel("gemini-1.5-flash")
    print("\n" + "*"*50)
    print("SUCCESS: GEMINI RAG IS ARMED AND READY!")
    print("*"*50 + "\n")
else:
    collection = chroma_client.get_or_create_collection(name="knowledge_base")
    llm_model = None
    print("\n" + "!"*50)
    print("WARNING: GEMINI_API_KEY IS MISSING! RAG WILL NOT WORK.")
    print("!"*50 + "\n")

class IngestRequest(BaseModel):
    text: str

class AskRequest(BaseModel):
    question: str

def chunk_text(text: str, chunk_size: int = 600, overlap: int = 100) -> List[str]:
    # Simple chunking using tiktoken for approximate token counting
    tokenizer = tiktoken.get_encoding("cl100k_base")
    tokens = tokenizer.encode(text)
    
    chunks = []
    for i in range(0, len(tokens), chunk_size - overlap):
        chunk_tokens = tokens[i:i + chunk_size]
        chunks.append(tokenizer.decode(chunk_tokens))
        if i + chunk_size >= len(tokens):
            break
    return chunks

@app.post("/ingest")
async def ingest(request: IngestRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=400, detail="GEMINI_API_KEY is missing in backend .env")
    try:
        # Clear previous knowledge for this demo
        existing = collection.get()
        if existing["ids"]:
            collection.delete(ids=existing["ids"])
            
        chunks = chunk_text(request.text)
        ids = [f"id{i}" for i in range(len(chunks))]
        
        collection.add(
            documents=chunks,
            ids=ids
        )
        return {"status": "indexed", "chunks": len(chunks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
async def ask(request: AskRequest):
    if not GEMINI_API_KEY or not llm_model:
        raise HTTPException(status_code=400, detail="GEMINI_API_KEY is missing in backend .env")
    try:
        # Retrieve top 4 relevant chunks
        results = collection.query(
            query_texts=[request.question],
            n_results=4
        )
        
        context = "\n\n".join(results["documents"][0])
        
        if not context.strip():
            return {"answer": "I don’t have enough information in the knowledge base."}

        prompt = (
            f"You are a helpful AI assistant.\n"
            f"Answer the question ONLY using the provided historical data and context below.\n"
            f"If the answer is not contained in the context, strictly respond with: \"I don’t have enough information in the knowledge base.\"\n\n"
            f"Context:\n{context}\n\n"
            f"Question: {request.question}"
        )
        
        response = llm_model.generate_content(prompt)
        
        return {"answer": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
