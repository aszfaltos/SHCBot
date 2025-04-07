from langchain.retrievers import BM25Retriever
from langchain.document import Document
from nltk.tokenize import word_tokenize

class KeywordSearchRetriever:
    """
    A class to perform keyword search on a list of documents.
    """
    def __init__(self, chunks: list[Document], top_k: int = 5):
        """
        Initialize a retriever with document chunks and the number of top results to retrieve.
        Args:
            chunks (list[Document]): A list of document chunks to search through.
            top_k (int): The number of top results to retrieve. Defaults to 5.
        """

        keyword_retriever = BM25Retriever.from_documents(
            chunks,
            k=top_k,
            preprocess_func=word_tokenize,
        )

        return keyword_retriever