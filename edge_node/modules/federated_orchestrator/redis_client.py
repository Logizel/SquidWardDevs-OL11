import json
import asyncio
import redis.asyncio as redis
from sqlalchemy import text
from config import settings
from database import SessionLocal

# Import our existing engines
from modules.synthetic_data_engine.ast_parser import generate_sql_from_criteria
from modules.privacy_engine.differential_privacy import apply_laplace_noise
from modules.privacy_engine.zkp import generate_execution_proof

async def listen_to_hub():
    """Runs continuously, listening for trial broadcasts from the Hub."""
    print(f"🏥 {settings.HOSPITAL_NAME} Edge Node booting up Redis listener...")
    
    try:
        redis_client = redis.Redis.from_url(settings.REDIS_URL)
        pubsub = redis_client.pubsub()
        await pubsub.subscribe("edge_node_tasks")
        print("🎧 Subscribed to 'edge_node_tasks'. Waiting for trials...")

        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                trial_id = data.get("trial_id")
                
                # The Hub sends a list of criteria dictionaries
                criteria_list = data.get("criteria", [])
                
                print(f"\n📥 Received Trial Request: {trial_id}")
                
                # Process the request using our existing logic
                await process_trial_locally(redis_client, trial_id, criteria_list)
                
    except Exception as e:
        print(f"❌ Redis Connection Error: {e}")

async def process_trial_locally(redis_client, trial_id: str, criteria_list: list):
    """Translates criteria via AI, queries local DB, and returns private count."""
    db = SessionLocal()
    try:
        # 1. Use the Deterministic AST Parser (No LLM, 0% Hallucination)
        sql_query = generate_sql_from_criteria({"criteria": criteria_list})
        print(f"⚙️ Deterministic SQL Generated: {sql_query}")
        
        # 2. Execute locally against hospital EHR
        result = db.execute(text(sql_query)).fetchone()
        true_count = result[0] if result else 0
        
        # --- NEW: K-ANONYMITY THRESHOLD ---
        # Prevents "Differencing Attacks" to single out rare diseases or specific people
        if 0 < true_count < 5:
            print(f"🛡️ K-Anonymity Triggered: Cohort of {true_count} is too small. Dropping to 0 to protect patient identities.")
            true_count = 0
            
        # 3. Cryptography & Privacy Math
        execution_proof = generate_execution_proof(sql_query, true_count)
        fuzzed_count = apply_laplace_noise(true_count, epsilon=0.5)
        
        # 4. Construct the exact response the Hub is waiting for
        response_payload = {
            "trial_id": trial_id,
            "hospital_name": settings.HOSPITAL_NAME,
            "patient_count": fuzzed_count,
            "execution_proof": execution_proof
        }
        
        # 5. Broadcast back to the Hub
        await redis_client.publish("hub_results", json.dumps(response_payload))
        print(f"📤 Sent {fuzzed_count} fuzzed patients back to Hub!")

    except Exception as e:
        print(f"⚠️ Error processing trial: {str(e)}")
    finally:
        db.close()