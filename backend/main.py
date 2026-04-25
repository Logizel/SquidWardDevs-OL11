from fastapi import FastAPI
from pydantic import BaseModel

# Initialize the FastAPI app
app = FastAPI(title="My First API", version="1.0.0")

# Define a data model for POST requests
class Item(BaseModel):
    name: str
    description: str | None = None
    price: float

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/items/")
def create_item(item: Item):
    return {"message": "Item created successfully", "item": item}

if __name__ == "__main__":
    print(f"App object exists: {app}")

