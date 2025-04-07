from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_openai import ChatOpenAI
from langchain.chains import create_retrieval_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain.retrievers import EnsembleRetriever

from document_loader import load_documents
from vector_db import VectorDB
from keyword_search import KeywordSearchRetriever
from reranker import Reranker

class Retriever:
    def __init__(self, vector_db_directory: str, embedding_model_name: str, reranker_model_name: str, chunk_size: int, chunk_overlap: int, dense_top_k: int = 5, sparse_top_k: int = 5, reranker_top_k: int = 5, glob: str="**/[!.]*", device: str = "cpu", recreate_vector_db: bool = False):
        """
        Initialize the Retriever class.
        Args:
            vector_db_directory (str): The directory containing the vector database.
            embedding_model_name (str): The name of the embedding model to use from HuggingFaceEmbeddings.
            reranker_model_name (str): The name of the reranker model to use from HuggingFaceCrossEncoder.
            chunk_size (int): The size of the chunks to split the documents into.
            chunk_overlap (int): The overlap between chunks.
            dense_top_k (int): The number of top results to retrieve using dense retrieval. Defaults to 5.
            sparse_top_k (int): The number of top results to retrieve using sparse retrieval. Defaults to 5.
            reranker_top_k (int): The number of top results to retrieve after reranking. Defaults to 5.
            glob (str): The glob pattern to match files. Defaults to "**/[!.]*".
            device (str): The device to use for the embedding model ("cpu" or "cuda"). Defaults to "cpu".
        """
        # Load documents
        chunks = load_documents(vector_db_directory, chunk_size, chunk_overlap, glob)

        # Init VectorDB
        self.vectorstore = VectorDB(
            directory=vector_db_directory,
            embedding_model_name=embedding_model_name,
            chunks=chunks,
            device=device,
            recreate=recreate_vector_db
        )

        # Create a retriever from the vectorstore
        self.vector_retriever = self.vectorstore.as_retriever(search_kwargs={"n_results": dense_top_k})

        # Create a keyword search retriever
        self.keyword_retriever = KeywordSearchRetriever(
            chunks=chunks,
            top_k=sparse_top_k
        )

        # Combine the two retrievers with ensemble
        self.ensemble_retriever = EnsembleRetriever(
            retrievers=[self.keyword_retriever, self.vector_retriever], weights=[0.5, 0.5]
        )

        # Set up reranker
        self.compression_retriever = Reranker(
            model_name=reranker_model_name,
            retriever=self.ensemble_retriever,
            top_k=reranker_top_k
        )

    def query(self, query_text: str) -> str:
        """
        Simple query function to search the vectorstore.
        Args:
            query_text (str): The query text to search for in the vectorstore.
        Returns:
            str: The concatenated page content of the retrieved documents.
        """
        retrieved_docs = self.compression_retriever.invoke(query_text)
        return "\n".join([doc.page_content for doc in retrieved_docs])
    
    def query_docs(self, query_text: str) -> str:
        """
        Simple query function to search the vectorstore.
        Args:
            query_text (str): The query text to search for in the vectorstore.
        Returns:
            str: The concatenated page content of the retrieved documents.
        """
        retrieved_docs = self.compression_retriever.invoke(query_text)
        return retrieved_docs
