// src/components/Login.tsx
import React, { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await loginUser(email, password);
      
      // Save the JWT token
      localStorage.setItem("token", data.access_token);
      
      alert("Login successful! Token saved.");
      // For now, redirect home. Later we can decode the token to route by role.
      navigate("/"); 
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email: </label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <br />
        <div>
          <label>Password: </label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <br />
        <button type="submit">Login</button>
      </form>
      <br />
      <Link to="/register">Don't have an account? Register here.</Link>
    </div>
  );
}
