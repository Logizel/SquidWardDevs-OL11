// src/api/auth.ts
const API_BASE = "http://localhost:8000/api/v1/auth";

export const registerUser = async (payload: any) => {
  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    // 👇 THE CHEAT CODE: Print the exact backend error to the console
    console.error("🚨 FASTAPI REJECTION:", JSON.stringify(errorData, null, 2));
    throw new Error(JSON.stringify(errorData));
  }
  return response.json();
};

export const loginUser = async (username: string, password: string) => {
  // FastAPI OAuth2 expects form-urlencoded data
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Login failed");
  }
  return response.json();
};

export const getCurrentUser = async (token: string) => {
  const response = await fetch(`${API_BASE}/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user details");
  }
  return response.json();
};
