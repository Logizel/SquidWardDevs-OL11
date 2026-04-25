async def generate_dua(trial_name: str, sponsor_name: str, hospital_name: str) -> str:
    """Generates a HIPAA/DPDP compliant Data Use Agreement."""
    return f"""
DATA USE AGREEMENT (DUA)
========================
This Data Use Agreement is entered into by and between {sponsor_name} ("Data Recipient") 
and {hospital_name} ("Data Provider").

1. PURPOSE OF DISCLOSURE
The Data Provider agrees to provide differentially private, aggregated statistical data 
regarding patients eligible for the trial: '{trial_name}'.

2. PRIVACY SAFEGUARDS (DPDP ACT COMPLIANCE)
No raw Electronic Health Records (EHR) shall be transferred. All data will be processed 
locally behind the Data Provider's firewall using federated learning architecture.
"""
