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
async def trigger_broadcast(trial_id: str, db: Session = Depends(get_db)):
    """The REAL Production Flow"""
    import json
    from modules.federated_orchestrator.redis_client import redis_client

    # 1. Fetch the real trial and its criteria from PostgreSQL
    trial = db.query(Trial).filter(Trial.id == trial_id).first()
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")

    # 2. Broadcast the REAL criteria to the Edge Nodes via Redis
    clean_criteria_list = [criterion.rule_parameters for criterion in trial.criteria]
    payload = {
        "trial_id": str(trial.id),
        "criteria": clean_criteria_list,  # Pulling straight from the DB!
    }

    await redis_client.publish("edge_node_tasks", json.dumps(payload))
    print(f"🚀 REAL BROADCAST VIA REDIS for Trial {trial_id}")

    return {
        "status": "success",
        "message": f"Trial {trial_id} broadcasted to Edge Nodes.",
    }
