import requests
from config import settings

def generate_sql_from_criteria(criteria_json: dict) -> str:
    """
    Translates the Hub's JSON criteria into local PostgreSQL.
    Uses OpenRouter API. NO PATIENT DATA IS SENT.
    """
    if not settings.OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY is missing from environment variables.")

    schema_context = """
    Table: local_patients (id UUID, age INT, gender VARCHAR)
    Table: patient_conditions (id UUID, patient_id UUID, icd10_code VARCHAR)
    """
    
    prompt = f"""
    You are an expert PostgreSQL developer. Given this schema:
    {schema_context}
    
    Write a SQL query that counts the total number of distinct patients who match these trial criteria:
    {criteria_json}
    
    Return ONLY the raw SQL query. No markdown, no explanations. 
    The query must return a single column named "count".
    """

    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "google/gemini-2.5-flash", # Or any fast/free OpenRouter model
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 200,
        }
    )
    
    if response.status_code == 200:
        return response.json()['choices'][0]['message']['content'].strip().replace("```sql", "").replace("```", "")
    else:
        raise Exception(f"OpenRouter API Error: {response.text}")
