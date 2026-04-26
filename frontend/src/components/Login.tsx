// src/components/Login.tsx
import React, { useState } from "react";
import { loginUser, getCurrentUser } from "../api/auth"; // 👈 NEW: Import getCurrentUser
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      // Step 1: Login to get the JWT Token
      const data = await loginUser(email, password);
      const token = data.access_token;
      
      // Save the JWT token
      localStorage.setItem("token", token);
      
      // Step 2: Fetch user profile to figure out their role
      const user = await getCurrentUser(token);
      
      // (Optional) Save user data so other components know who is logged in
      localStorage.setItem("user", JSON.stringify(user));
      
      // Step 3: The Role-Based Router
      if (user.role === "sponsor") {
        navigate("/trial-builder");
      } else if (user.role === "hospital") {
        navigate("/hospital-dashboard");
      } else {
        // Fallback for admins or unknown roles
        navigate("/"); 
      }
      
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email: </label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            disabled={isLoggingIn}
          />
        </div>
        <br />
        <div>
          <label>Password: </label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            disabled={isLoggingIn}
          />
        </div>
        <br />
        <button type="submit" disabled={isLoggingIn}>
          {isLoggingIn ? "Authenticating..." : "Login"}
        </button>
      </form>
      <br />
      <Link to="/register">Don't have an account? Register here.</Link>
    </div>
  );
}
