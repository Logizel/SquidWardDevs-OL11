from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlalchemy.orm import Session
from modules.auth_management.dependencies import get_db
from models.trial import Trial
from modules.federated_orchestrator.websocket_manager import manager
from modules.federated_orchestrator.redis_client import publish_trial_to_edge

router = APIRouter()


@router.websocket("/ws/{trial_id}")
async def websocket_endpoint(websocket: WebSocket, trial_id: str):
    """Frontend React connects here to listen for live patient matches."""
    await manager.connect(websocket, trial_id)
    try:
        while True:
            # Keeps the connection open waiting for client disconnect
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, trial_id)


@router.post("/trials/{trial_id}/broadcast")
async def trigger_broadcast(trial_id: str):
    """TESTING BYPASS: Forces a message to Redis without checking the DB."""
    import json
    from modules.federated_orchestrator.redis_client import redis_client
    
    # We use a hardcoded payload so we don't need to look up a real trial in the DB
    dummy_payload = {
        "trial_id": trial_id,
        "criteria": [
            {"min_age": 25, "gender": "Female", "required_conditions": ["E11"]},
            {"forbidden_conditions": ["I50.1"]}
        ]
    }
    
    await redis_client.publish("edge_node_tasks", json.dumps(dummy_payload))
    print("🚀 FORCED BROADCAST VIA REDIS")

    return {
        "status": "success",
        "message": f"Forced broadcast of trial {trial_id} to Edge Nodes.",
    }