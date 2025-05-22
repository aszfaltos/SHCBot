from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from rag_chain import RAGChain
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv(override=True)

# Initialize FastAPI app with lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan function to initialize and clean up resources.
    """
    rag_chain = RAGChain()
    app.state.rag_chain = rag_chain
    yield
    print("Cleaning up resources...")

app = FastAPI(
    title="SHCBot API",
    description="API for querying the RAG system and getting an answer from OpenAI models",
    version="1.0.0",
    lifespan=lifespan,
)

class QueryRequest(BaseModel):
    """
    Request model for querying the RAGChain.
    """
    message: str
    chat_history: list[dict]  # List of messages with 'role' and 'content' keys

class QueryResponse(BaseModel):
    """
    Response model for the query.
    """
    answer: str

@app.post("/query", response_model=QueryResponse)
async def query_rag_chain(request: QueryRequest, fastapi_request: Request):
    """
    Endpoint to query the RAGChain.
    Args:
        request (QueryRequest): The request containing the user message and chat history.
        fastapi_request (Request): The FastAPI request object to access app state.
    Returns:
        QueryResponse: The generated answer.
    """
    # Access rag_chain directly from app.state
    rag_chain = fastapi_request.app.state.rag_chain
    if not rag_chain:
        raise HTTPException(status_code=500, detail="RAGChain is not initialized.")

    try:
        # Call the inference method of RAGChain
        chat_history = request.chat_history
        chat_history.append({"role": "user", "content": request.message})
        answer = rag_chain.inference(chat_history)
        return QueryResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    """
    Simple health check endpoint.
    """
    return {"status": "ok"}
