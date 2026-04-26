import os
import json
import asyncio
import redis.asyncio as redis
from modules.federated_orchestrator.websocket_manager import manager
from database import SessionLocal
from models.audit import AuditLog  # Ensure you have created backend/models/audit.py!

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Create the async Redis connection
redis_pool = redis.ConnectionPool.from_url(REDIS_URL)
redis_client = redis.Redis(connection_pool=redis_pool)


async def publish_trial_to_edge(trial_id: str, criteria: list):
    """Broadcasts the JSONB criteria to all listening Edge Nodes."""
    payload = {"trial_id": trial_id, "criteria": [c.rule_parameters for c in criteria]}
    await redis_client.publish("edge_node_tasks", json.dumps(payload))
    print(f"🚀 Broadcasted Trial {trial_id} to Edge Nodes via Redis")


async def listen_for_edge_results():
    """
    Runs continuously in the background, listening for hospital responses.
    Captures fuzzed results for Sponsors and true audit data for Hospitals.
    """
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("hub_results")

    print("🎧 Hub is now listening for Edge Node results...")

    async for message in pubsub.listen():
        if message["type"] == "message":
            try:
                data = json.loads(message["data"])

                # Log the raw payload for verification
                print(
                    f"\n🔒 RAW SECURE PAYLOAD RECEIVED: {json.dumps(data, indent=2)}\n"
                )

                trial_id = data.get("trial_id")
                hospital_name = data.get("hospital_name")
                patient_count = data.get(
                    "patient_count"
                )  # Fuzzed via Differential Privacy
                true_count = data.get("true_count")  # Real count for Hospital Audit
                sql_query = data.get("sql_query")  # The SQL used by Edge Node
                execution_proof = data.get("execution_proof")

                print(
                    f"✅ Received {patient_count} patients from {hospital_name} for Trial {trial_id}"
                )

                # --- 1. PERSIST TO DATABASE FOR HOSPITAL AUDIT DASHBOARD ---
                db = SessionLocal()
                try:
                    new_log = AuditLog(
                        trial_id=trial_id,
                        hospital_name=hospital_name,
                        true_count=true_count,
                        fuzzed_count=patient_count,
                        sql_query=sql_query,
                        execution_proof=execution_proof,
                    )
                    db.add(new_log)
                    db.commit()
                    print(f"📝 Audit log saved to database for {hospital_name}")
                except Exception as db_err:
                    print(f"❌ Database Error: {db_err}")
                    db.rollback()
                finally:
                    db.close()

                # --- 2. FORWARD TO SPONSOR FRONTEND VIA WEBSOCKETS ---
                await manager.broadcast_to_trial(
                    trial_id=trial_id,
                    message={
                        "event": "new_match",
                        "hospital": hospital_name,
                        "count": patient_count,
                        "proof": execution_proof,
                        "sql": sql_query,  # Sent for transparency in UI
                    },
                )
            except Exception as e:
                print(f"❌ Error in Redis Listener: {e}")
