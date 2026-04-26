// src/App.tsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import TrialBuilder from "./components/TrialBuilder";
import HospitalDashboard from "./components/HospitalDashboard";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const location = useLocation(); // Used to trigger a re-check on navigation
  const navigate = useNavigate();

  useEffect(() => {
    // Every time the URL changes, check if the user is logged in
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  }, [location]); // Re-run this effect whenever the route changes

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <div>
      <h1>Medora Hub Frontend (Raw)</h1>
      <nav>
        {/* If NO user is logged in, show Login and Register */}
        {!user ? (
          <>
            <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
          </>
        ) : (
          /* If a user IS logged in, show only their specific dashboard and a Logout button */
          <>
            {user.role === "sponsor" && <Link to="/trial-builder">Sponsor Dashboard</Link>}
            {user.role === "site_admin" && <Link to="/hospital-dashboard">Hospital Dashboard</Link>}
            
            <span style={{ margin: "0 10px" }}>|</span>
            <button 
              onClick={handleLogout} 
              style={{ 
                background: "none", 
                border: "none", 
                color: "blue", 
                textDecoration: "underline", 
                cursor: "pointer", 
                padding: 0, 
                font: "inherit" 
              }}
            >
              Logout
            </button>
          </>
        )}
      </nav>
      <hr />
      
      <Routes>
        <Route path="/" element={<h3>Welcome Home. Please navigate to Login or Register.</h3>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/trial-builder" element={<TrialBuilder />} />
        <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
      </Routes>
    </div>
  );
}
