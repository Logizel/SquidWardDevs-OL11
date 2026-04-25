// src/components/Register.tsx
import React, { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("sponsor");
  
  // Role-specific fields
  const [corporateId, setCorporateId] = useState("");
  const [hospitalName, setHospitalName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      email,
      password,
      role,
      ...(role === "sponsor" && { corporate_id_number: corporateId }),
      ...(role === "hospital" && { hospital_name: hospitalName }),
    };

    try {
      await registerUser(payload);
      alert("Registration successful! Please wait for admin approval.");
      navigate("/login");
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
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
        <div>
          <label>Role: </label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="sponsor">Sponsor</option>
            <option value="hospital">Hospital</option>
          </select>
        </div>
        <br />

        {role === "sponsor" && (
          <div>
            <label>Corporate ID Number: </label>
            <input type="text" value={corporateId} onChange={e => setCorporateId(e.target.value)} required />
          </div>
        )}

        {role === "hospital" && (
          <div>
            <label>Hospital Name: </label>
            <input type="text" value={hospitalName} onChange={e => setHospitalName(e.target.value)} required />
          </div>
        )}
        <br />
        
        <button type="submit">Submit Registration</button>
      </form>
      <br />
      <Link to="/login">Already have an account? Login here.</Link>
    </div>
  );
}
