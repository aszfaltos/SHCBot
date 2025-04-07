import os

from langchain.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.document import Document

class VectorDB:
    def __init__(self, directory: str, embedding_model_name: str, chunks: list[Document], device: str = "cpu", recreate: bool = False):
        """
        Initialize the VectorDB class.
        Args:
            directory (str): The directory containing the documents to be indexed.
            embedding_model_name (str): The name of the embedding model to use from HuggingFaceEmbeddings.
            chunks (list[Document]): The list of document chunks to be indexed.
            device (str): The device to use for the embedding model ("cpu" or "cuda"). Defaults to "cpu".
            recreate (bool): Whether to recreate the vector database if it already exists. Defaults to False.
        """
        # Check recreate flag
        if recreate:
            # Delete the existing vector db
            if self._vector_db_exists(directory):
                try:
                    for root, dirs, files in os.walk(directory, topdown=False):
                        for name in files:
                            os.remove(os.path.join(root, name))
                        for name in dirs:
                            os.rmdir(os.path.join(root, name))
                    os.rmdir(directory)
                except Exception as e:
                    raise Exception(f"Error deleting vector db in {directory} with {e}")
        
        # Check if the vector db exists
        if self._vector_db_exists(directory):
            # Load vector db
            self._load_vector_db(
                directory=directory,
                embedding_model_name=embedding_model_name,
                device=device
            )
        else:
            # Create vector db
            self._create_vector_db(
                directory=directory,
                embedding_model_name=embedding_model_name,
                chunks=chunks,
                device=device
            )
        
        return self.vectorstore

    def _vector_db_exists(self, directory: str) -> bool:
        """
        Check if the vector database exists in the specified directory.
        Args:
            directory (str): The directory to check for the vector database.
        Returns:
            bool: True if the vector database exists, False otherwise.
        """
        return os.path.exists(directory) and os.path.isdir(directory)
    
    def _create_vector_db(self, directory: str, embedding_model_name: str, chunks: list[Document], device: str = "cpu"):
        """
        Create a vector database from the given directory.
        Args:
            directory (str): The directory containing the documents to be indexed.
            embedding_model (str): The name of the embedding model to use from HuggingFaceEmbeddings.
            chunks (list[Document]): The list of document chunks to be indexed.
            device (str): The device to use for the embedding model ("cpu" or "cuda"). Defaults to "cpu".
        """

        # Create embeddings using HuggingFaceEmbeddings
        embedding_model = HuggingFaceEmbeddings(model_name=embedding_model_name, model_kwargs={"device": device})

        self.vectorstore = FAISS.from_documents(
            documents=chunks,
            embedding=embedding_model
        )

        # Save the vectorstore to disk
        self.vectorstore.save_local(directory)

    def _load_vector_db(self, directory: str, embedding_model_name: str, device:str = "cpu"):
        """
        Load the vector database from the specified directory.
        Args:
            directory (str): The directory containing the vector database.
            embedding_model_name (str): The name of the embedding model to use from HuggingFaceEmbeddings.
            device (str): The device to use for the embedding model ("cpu" or "cuda"). Defaults to "cpu".
        """

        # Create embeddings using HuggingFaceEmbeddings
        embedding_model = HuggingFaceEmbeddings(model_name=embedding_model_name, model_kwargs={"device": device})

        # Load the vectorstore from the specified directory
        self.vectorstore = FAISS.from_documents(
            folder_path=directory,
            embeddings=embedding_model,
            allow_dangerous_deserialization=True,
        )

    def query(self, query_text: str, top_k: int) -> str:
        """
        Simple query function to search the vectorstore.
        Args:
            query_text (str): The query text to search for in the vectorstore.
            top_k (int): The number of top results to return.
        Returns:
            str: The concatenated page content of the retrieved documents.
        """
        # Query the vectorstore
        query_result = self.vectorstore.similarity_search(query_text, k=top_k)
        # Simply concat the page_content of the retrieved documents
        return "\n".join([doc.page_content for doc in query_result])
    
    def query_docs(self, query_text: str, top_k: int) -> str:
        """
        Query the vectorstore and return the raw documents.
        Args:
            query_text (str): The query text to search for in the vectorstore.
            top_k (int): The number of top results to return.
        Returns:
            str: The concatenated page content of the retrieved documents.
        """
        return self.vectorstore.similarity_search(query_text, k=top_k)