from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any

from database import get_db
from modules.synthetic_data_engine.ollama_client import generate_sql_from_criteria
from modules.privacy_engine.differential_privacy import apply_laplace_noise
from modules.privacy_engine.zkp import generate_execution_proof

router = APIRouter()

@router.post("/feasibility")
def calculate_cohort_feasibility(
    criteria: Dict[str, Any], 
    db: Session = Depends(get_db)
):
    """
    Receives JSON criteria from the Hub, executes it locally, and returns a fuzzed count with a cryptographic proof.
    """
    try:
        # 1. Translate JSON to SQL
        sql_query = generate_sql_from_criteria(criteria)
        
        # 2. Execute locally against the EHR
        result = db.execute(text(sql_query)).fetchone()
        true_count = result[0] if result else 0
        
        # 3. Generate the Zero-Knowledge Proof (binds the query to the true result)
        execution_proof = generate_execution_proof(sql_query, true_count)
        
        # 4. Apply Differential Privacy (Mathematical Noise)
        fuzzed_count = apply_laplace_noise(true_count, epsilon=0.5)
        
        return {
            "status": "success",
            "noisy_patient_count": fuzzed_count,
            "execution_proof": execution_proof,
            "debug_generated_sql": sql_query # Keep for testing, remove for production
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))