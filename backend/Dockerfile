# backend/Dockerfile

# Use official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
# (Make sure you create a requirements.txt in your backend folder!)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend code
COPY . .

# Make port 8000 available to the outside
EXPOSE 8000

# Command to run the FastAPI application using Uvicorn
# The --reload flag is great for local development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
