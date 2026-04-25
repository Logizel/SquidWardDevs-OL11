// src/api/trial.ts
const API_BASE = "http://localhost:8000/api/v1";

export const saveTrial = async (token: string, payload: any) => {
  const response = await fetch(`${API_BASE}/trials/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Save Error Details:", errorData);
    throw new Error("Failed to save trial to database. Check console for 422 errors.");
  }
  return response.json();
};

export const broadcastTrial = async (token: string, trialId: string) => {
  const response = await fetch(`${API_BASE}/orchestrator/trials/${trialId}/broadcast`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to broadcast trial over Redis");
  }
  return response.json();
};
