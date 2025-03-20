# Base image (Python 3.10 or later)
FROM python:3.10-bookworm

# Set the working directory
WORKDIR /

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose a port (optional, if using Flask/FastAPI)
EXPOSE 5001

# Run the AI application (modify as needed)
CMD ["python", "app.py"]

