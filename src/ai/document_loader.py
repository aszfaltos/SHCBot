from langchain_text_splitters import TokenTextSplitter
from transformers import AutoTokenizer
from langchain_community.document_loaders import DirectoryLoader

import logging

logger = logging.getLogger("uvicorn.error")

def load_documents(directory: str, chunk_size: int, chunk_overlap: int, glob: str = "**/[!.]*") -> list:
    """
    Load documents from a directory using a glob pattern, then splitting them into chunks.
    Args:
        directory (str): The directory to load documents from.
        glob (str): The glob pattern to match files. Defaults to "**/[!.]*".

    Returns:
        list: A list of document chunks.
    """
    loader = DirectoryLoader(path=directory, glob=glob)
    documents = loader.load()

    # Split documents into chunks
    logger.info("Splitting documents...")
    tokenizer = AutoTokenizer.from_pretrained("BAAI/bge-m3")

    # Define a function to count tokens
    def count_tokens(text):
        return len(tokenizer.encode(text))

    # Initialize the TokenTextSplitter
    text_splitter = TokenTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=count_tokens
    )

    # Split your text
    chunks = text_splitter.split_documents(documents)

    return chunks