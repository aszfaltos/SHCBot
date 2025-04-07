import os

from langchain.vectorstores import FAISS
from langchain_openai import ChatOpenAI
from langchain.chains import create_retrieval_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.chains.combine_documents import create_stuff_documents_chain

class VectorDB:
    def __init__(self, directory: str, embedding_model_name: str, chunk_size: int, chunk_overlap: int, top_k: int = 5, glob: str="**/[!.]*", device: str = "cpu", recreate: bool = False):
        """
        Initialize the VectorDB class.
        Args:
            directory (str): The directory containing the documents to be indexed.
            embedding_model_name (str): The name of the embedding model to use from HuggingFaceEmbeddings.
            chunk_size (int): The size of the chunks to split the documents into.
            chunk_overlap (int): The overlap between chunks.
            top_k (int): The number of top results to retrieve. Defaults to 5.
            glob (str): The glob pattern to match files. Defaults to "**/[!.]*".
            device (str): The device to use for the embedding model ("cpu" or "cuda"). Defaults to "cpu".
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
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                glob=glob,
                device=device
            )
        
        # Create a retriever from the vectorstore
        self.retriever = self.vectorstore.as_retriever(search_kwargs={"n_results": top_k})

    def query(self, query_text: str, top_k: int) -> str:
        #return self.vectorstore.similarity_search(query_text, k=top_k) # This returns also the metadata, we can use it later
        # Query the vectorstore
        query_result = self.vectorstore.similarity_search(query_text, k=top_k)
        # Simply concat the page_content of the retrieved documents
        return "\n".join([doc.page_content for doc in query_result])

    def _vector_db_exists(self, directory: str) -> bool:
        """
        Check if the vector database exists in the specified directory.
        Args:
            directory (str): The directory to check for the vector database.
        Returns:
            bool: True if the vector database exists, False otherwise.
        """
        return os.path.exists(directory) and os.path.isdir(directory)
    
    def _create_vector_db(self, directory: str, embedding_model_name: str, chunk_size: int, chunk_overlap: int, glob: str, device: str = "cpu"):
        """
        Create a vector database from the given directory.
        Args:
            directory (str): The directory containing the documents to be indexed.
            embedding_model (str): The name of the embedding model to use from HuggingFaceEmbeddings.
            chunk_size (int): The size of the chunks to split the documents into.
            chunk_overlap (int): The overlap between chunks.
            glob (str): The glob pattern to match files.
            device (str): The device to use for the embedding model ("cpu" or "cuda"). Defaults to "cpu".
        """
        loader = DirectoryLoader(directory=directory, glob=glob)
        documents = loader.load()

        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        chunks = text_splitter.split_documents(documents)

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