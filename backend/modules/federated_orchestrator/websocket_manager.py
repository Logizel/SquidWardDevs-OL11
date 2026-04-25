from fastapi import WebSocket
from typing import Dict, List
import json


class ConnectionManager:
    def __init__(self):
        # Maps a trial_id (string) to a list of active WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, trial_id: str):
        await websocket.accept()
        if trial_id not in self.active_connections:
            self.active_connections[trial_id] = []
        self.active_connections[trial_id].append(websocket)

    def disconnect(self, websocket: WebSocket, trial_id: str):
        if trial_id in self.active_connections:
            self.active_connections[trial_id].remove(websocket)
            if not self.active_connections[trial_id]:
                del self.active_connections[trial_id]

    async def broadcast_to_trial(self, trial_id: str, message: dict):
        """Sends live updates only to the Sponsor watching this specific trial."""
        if trial_id in self.active_connections:
            for connection in self.active_connections[trial_id]:
                await connection.send_text(json.dumps(message))


manager = ConnectionManager()
