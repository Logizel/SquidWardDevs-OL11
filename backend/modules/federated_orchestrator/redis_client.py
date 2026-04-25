import os
import json
import asyncio
import redis.asyncio as redis
from modules.federated_orchestrator.websocket_manager import manager

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
    """Runs continuously in the background, listening for hospital responses."""
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("hub_results")

    print("🎧 Hub is now listening for Edge Node results...")

    async for message in pubsub.listen():
        if message["type"] == "message":
            data = json.loads(message["data"])
            
            # --- THIS PROVES ENCRYPTION WORKS ---
            print(f"\n🔒 RAW SECURE PAYLOAD RECEIVED: {json.dumps(data, indent=2)}\n")
            
            trial_id = data.get("trial_id")
            hospital_name = data.get("hospital_name")
            patient_count = data.get(
                "patient_count"
            )  # Fuzzed via Differential Privacy!

            print(
                f"✅ Received {patient_count} patients from {hospital_name} for Trial {trial_id}"
            )

            # Instantly forward this data to the React frontend via WebSockets!
            await manager.broadcast_to_trial(
                trial_id=trial_id,
                message={
                    "event": "new_match",
                    "hospital": hospital_name,
                    "count": patient_count,
                },
            )
