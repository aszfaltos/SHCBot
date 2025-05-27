# Base image (Python 3.10 or later)
FROM python:3.10-bookworm

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 libmagic1 libmagic-dev poppler-utils \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install langchain-huggingface
RUN python -c "from langchain_huggingface import HuggingFaceEmbeddings; HuggingFaceEmbeddings(model_name='intfloat/multilingual-e5-small')"
RUN python -c "from langchain_community.cross_encoders import HuggingFaceCrossEncoder; HuggingFaceCrossEncoder(model_name='BAAI/bge-reranker-v2-m3')"
RUN python -c "import nltk; nltk.download('punkt')"

# Copy the application code
COPY . .

# Expose the port
EXPOSE 8000

# Run the FastAPI app
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]

