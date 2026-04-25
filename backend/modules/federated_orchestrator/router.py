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
    """Sponsor clicks 'Find Patients' and hits this endpoint."""
    # 1. Fetch the trial and its criteria from PostgreSQL
    trial = db.query(Trial).filter(Trial.id == trial_id).first()
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")

    # 2. Broadcast it to the Edge Nodes via Redis
    await publish_trial_to_edge(str(trial.id), trial.criteria)

    return {
        "status": "success",
        "message": f"Trial {trial_id} broadcasted to Edge Nodes.",
    }
