// src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import TrialBuilder from "./components/TrialBuilder"; // 👈 NEW IMPORT

export default function App() {
  return (
    <BrowserRouter>
      <div>
        <h1>Medora Hub Frontend (Raw)</h1>
        <nav>
          <Link to="/login">Login</Link> | <Link to="/register">Register</Link> | <Link to="/trial-builder">Sponsor Dashboard</Link>
        </nav>
        <hr />
        
        <Routes>
          <Route path="/" element={<h3>Welcome Home. Please navigate to Login or Register.</h3>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/trial-builder" element={<TrialBuilder />} /> {/* 👈 NEW ROUTE */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}
