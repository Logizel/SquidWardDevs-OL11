import hashlib
import hmac
import os

# In a real environment, this is a secure environment variable specific to the hospital node.
NODE_SECRET_KEY = os.getenv("NODE_SECRET_KEY", "super-secret-hospital-key-123")

def generate_execution_proof(sql_query: str, true_count: int) -> str:
    """
    Generates a cryptographic commitment (Proof of Execution).
    It mathematically binds the exact SQL query executed to the exact true count found.
    """
    # Normalize the query to ensure consistent hashing (remove trailing spaces, lowercase)
    normalized_sql = sql_query.strip().lower()
    
    # The payload binds the query and the un-fuzzed, true result
    payload = f"{normalized_sql}||TRUE_COUNT={true_count}".encode('utf-8')
    
    # Generate the cryptographic signature
    cryptographic_hash = hmac.new(
        key=NODE_SECRET_KEY.encode('utf-8'),
        msg=payload,
        digestmod=hashlib.sha256
    ).hexdigest()
    
    return f"proof_{cryptographic_hash}"