// src/api/hospital.ts
const API_BASE = "http://localhost:8000/api/v1";

// Fetch actual audit logs from the Hub database
export const getIncomingQueries = async (token: string) => {
  const response = await fetch(`${API_BASE}/hospital/queries`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to fetch real-time audit logs");
  }
  return response.json();
};

// Approve a Data Use Agreement (DUA) - Triggers the AI Negotiator Agent
export const approveAgreement = async (token: string, queryId: string) => {
  const response = await fetch(`${API_BASE}/negotiate/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ query_id: queryId }),
  });

  if (!response.ok) {
    throw new Error("Failed to authorize the Data Use Agreement");
  }
  return response.json();
};
