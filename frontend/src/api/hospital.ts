// src/api/hospital.ts
const API_BASE = "http://localhost:8000/api/v1";

// Fetch all queries that have hit this specific hospital's Edge Node
export const getIncomingQueries = async (token: string) => {
  const response = await fetch(`${API_BASE}/hospital/queries`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch hospital queries");
  }
  return response.json();
};

// Approve a Data Use Agreement (DUA) from a Sponsor
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
    throw new Error("Failed to approve agreement");
  }
  return response.json();
};
