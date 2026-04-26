// src/components/TrialBuilder.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveTrial, broadcastTrial } from "../api/trial";

/**
 * TrialBuilder Component
 * * CORE PURPOSE:
 * 1. Build complex clinical trial criteria using a dynamic UI (AST Parser compliant).
 * 2. Save trial metadata and criteria to the central PostgreSQL database.
 * 3. Orchestrate a federated broadcast across the Edge Network via Redis.
 * 4. Listen to live, cryptographically verified responses from hospitals via WebSockets.
 */
export default function TrialBuilder() {
  const navigate = useNavigate();
  
  // =========================================================================
  // 1. METADATA STATE
  // =========================================================================
  const [trialName, setTrialName] = useState("Project Aegis Phase II");
  const [targetDisease, setTargetDisease] = useState("Type 2 Diabetes");
  const [diseaseCode, setDiseaseCode] = useState("E11");
  const [description, setDescription] = useState("Federated trial to find E11 patients while maintaining K-Anonymity.");
  const [phase, setPhase] = useState("Phase II");

  // =========================================================================
  // 2. DYNAMIC RULES STATE (The AST Parser Engine)
  // =========================================================================
  const [rules, setRules] = useState<any[]>([]);

  // =========================================================================
  // 3. WEBSOCKET & LIVE RESULTS STATE
  // =========================================================================
  const [liveResults, setLiveResults] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);

  // --- Rule Management Functions ---

  const addRule = (type: string) => {
    if (type === "demographics") {
      setRules([...rules, { id: Date.now(), type, min_age: 18, max_age: 100, gender: "Any" }]);
    } else if (type === "inclusion" || type === "exclusion") {
      setRules([...rules, { id: Date.now(), type, condition: "" }]);
    }
  };

  const updateRule = (index: number, key: string, value: any) => {
    const newRules = [...rules];
    newRules[index][key] = value;
    setRules(newRules);
  };

  const deleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  // --- Payload Formatter ---
  // Maps the React state to the strict nested JSON structure for FastAPI Pydantic models.
  const buildPayload = () => {
    const formattedCriteria = rules.map((r) => {
      if (r.type === "demographics") {
        return {
          type: "inclusion",
          category: "demographics",
          rule_parameters: {
            min_age: Number(r.min_age),
            max_age: Number(r.max_age),
            gender: r.gender,
          },
        };
      }
      if (r.type === "inclusion") {
        return {
          type: "inclusion",
          category: "medical_history",
          rule_parameters: { required_conditions: [r.condition] },
        };
      }
      if (r.type === "exclusion") {
        return {
          type: "exclusion",
          category: "medical_history",
          rule_parameters: { forbidden_conditions: [r.condition] },
        };
      }
      return null;
    }).filter(Boolean);

    return {
      name: trialName,
      description: description,
      phase: phase,
      target_disease_name: targetDisease,
      target_disease_code: diseaseCode,
      criteria: formattedCriteria,
    };
  };

  // =========================================================================
  // 4. THE MASTER EXECUTION FLOW (Save -> Socket -> Broadcast)
  // =========================================================================
  const handleBroadcast = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No authentication token found. Please log in.");
      navigate("/login");
      return;
    }

    try {
      // STEP 1: Persist the trial to Hub Database
      const payload = buildPayload();
      console.log("1. Saving to database...", payload);
      const savedTrial = await saveTrial(token, payload);
      const trialId = savedTrial.id;
      
      // STEP 2: Initiate WebSocket connection to the Orchestrator
      // This is vital to catch asynchronous Redis messages from Edge Nodes.
      const wsUrl = `ws://localhost:8000/api/v1/orchestrator/ws/${trialId}`;
      console.log(`2. Connecting to WebSocket: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsListening(true);
        setLiveResults([]); // Flush results from previous runs
        console.log("📡 Connected to Hub WebSocket! Waiting for Edge Node computations...");
      };

      ws.onmessage = (event) => {
        const incomingData = JSON.parse(event.data);
        console.log("📥 Incoming Data from Edge Network:", incomingData);
        // Append new matches to the live results list
        setLiveResults((prev) => [...prev, incomingData]);
      };

      ws.onclose = () => {
        setIsListening(false);
        console.log("WebSocket connection closed.");
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error Encountered:", error);
      };

      // STEP 3: Trigger the Federated Broadcast
      // The backend will now push the task to Redis 'edge_node_tasks' channel.
      console.log(`3. Broadcasting Trial ID: ${trialId}`);
      await broadcastTrial(token, trialId);
      
    } catch (error: any) {
      alert("Execution Failed: " + error.message);
    }
  };

  return (
    <div style={{ fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif", padding: "30px", color: "#333" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "24px" }}>Sponsor Dashboard: Federated Orchestrator</h1>
        <button 
          onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
          style={{ padding: "10px 20px", cursor: "pointer", background: "#f44336", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold" }}
        >
          Logout
        </button>
      </div>
      <hr style={{ border: "0", borderTop: "1px solid #ddd", marginBottom: "30px" }} />

      {/* 3-Column Workspace */}
      <div style={{ display: "flex", gap: "25px", alignItems: "flex-start" }}>
        
        {/* COLUMN 1: THE BUILDER UI */}
        <div style={{ flex: "1.2", minWidth: "400px" }}>
          
          <fieldset style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "10px", backgroundColor: "#fdfdfd" }}>
            <legend style={{ padding: "0 10px", fontWeight: "bold", fontSize: "18px" }}>1. Trial Specification</legend>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Trial Identifier:</label>
              <input style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} value={trialName} onChange={e => setTrialName(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Clinical Phase:</label>
                <select style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} value={phase} onChange={e => setPhase(e.target.value)}>
                  <option>Phase I</option><option>Phase II</option><option>Phase III</option><option>Phase IV</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Primary Disease Code:</label>
                <input style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }} value={diseaseCode} onChange={e => setDiseaseCode(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: "5px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}>Protocol Description:</label>
              <textarea rows={3} style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px", resize: "none" }} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </fieldset>

          <br/>

          <fieldset style={{ border: "1px solid #ccc", padding: "20px", borderRadius: "10px", backgroundColor: "#fdfdfd" }}>
            <legend style={{ padding: "0 10px", fontWeight: "bold", fontSize: "18px" }}>2. Federated Inclusion/Exclusion Rules</legend>
            
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              <button onClick={() => addRule("demographics")} style={{ flex: 1, padding: "8px", cursor: "pointer", background: "#eee", border: "1px solid #bbb", borderRadius: "4px" }}>+ Demographic</button> 
              <button onClick={() => addRule("inclusion")} style={{ flex: 1, padding: "8px", cursor: "pointer", background: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7", borderRadius: "4px", fontWeight: "600" }}>+ Inclusion</button> 
              <button onClick={() => addRule("exclusion")} style={{ flex: 1, padding: "8px", cursor: "pointer", background: "#ffebee", color: "#c62828", border: "1px solid #ef9a9a", borderRadius: "4px", fontWeight: "600" }}>+ Exclusion</button>
            </div>

            {rules.map((rule, index) => (
              <div key={rule.id} style={{ border: "1px solid #e0e0e0", padding: "15px", marginBottom: "15px", background: "#fff", borderRadius: "6px", position: "relative", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: rule.type === "exclusion" ? "#c62828" : rule.type === "inclusion" ? "#2e7d32" : "#555" }}>
                    {rule.type.toUpperCase()} CRITERIA
                  </span>
                  <button onClick={() => deleteRule(index)} style={{ border: "none", background: "none", color: "#999", cursor: "pointer", fontSize: "12px", textDecoration: "underline" }}>Remove</button>
                </div>
                
                {rule.type === "demographics" && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <label style={{ fontSize: "13px" }}>Min Age: <input type="number" style={{ width: "50px" }} value={rule.min_age} onChange={e => updateRule(index, "min_age", e.target.value)} /></label>
                    <label style={{ fontSize: "13px" }}>Max Age: <input type="number" style={{ width: "50px" }} value={rule.max_age} onChange={e => updateRule(index, "max_age", e.target.value)} /></label>
                    <label style={{ fontSize: "13px" }}>Gender: 
                      <select value={rule.gender} onChange={e => updateRule(index, "gender", e.target.value)}>
                        <option>Any</option><option>Male</option><option>Female</option>
                      </select>
                    </label>
                  </div>
                )}

                {(rule.type === "inclusion" || rule.type === "exclusion") && (
                  <div>
                    <label style={{ fontSize: "13px" }}>ICD-10 Code Requirement: <br/>
                      <input style={{ width: "100%", padding: "6px", marginTop: "5px", boxSizing: "border-box" }} placeholder="e.g. E11, I50.1" value={rule.condition} onChange={e => updateRule(index, "condition", e.target.value)} />
                    </label>
                  </div>
                )}
              </div>
            ))}
          </fieldset>

          <br/>
          <button 
            onClick={handleBroadcast} 
            style={{ width: "100%", padding: "18px", fontSize: "18px", fontWeight: "bold", cursor: "pointer", backgroundColor: "#222", color: "#fff", border: "none", borderRadius: "8px", transition: "background 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#444"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#222"}
          >
            🚀 Execute Federated Query
          </button>
        </div>

        {/* COLUMN 2: JSON PAYLOAD PREVIEW */}
        <div style={{ flex: 1, borderLeft: "2px solid #f0f0f0", paddingLeft: "25px" }}>
          <h3 style={{ marginTop: 0 }}>Payload Inspection</h3>
          <p style={{ fontSize: "13px", color: "#777", marginBottom: "15px" }}>Real-time serialization of the AST criteria objects.</p>
          <pre style={{ background: "#1e1e1e", color: "#dcdcdc", padding: "20px", overflowX: "auto", borderRadius: "10px", fontSize: "13px", lineHeight: "1.5", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)" }}>
            {JSON.stringify(buildPayload(), null, 2)}
          </pre>
        </div>

        {/* COLUMN 3: LIVE RESULTS MONITOR */}
        <div style={{ flex: 1.1, borderLeft: "2px solid #f0f0f0", paddingLeft: "25px" }}>
          <div style={{ backgroundColor: isListening ? "#f0fdf4" : "#fafafa", padding: "20px", border: "1px solid", borderColor: isListening ? "#bbf7d0" : "#eee", borderRadius: "10px", minHeight: "400px" }}>
            <h3 style={{ marginTop: 0 }}>📡 Edge Node Monitor</h3>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "25px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: isListening ? "#22c55e" : "#d1d5db", boxShadow: isListening ? "0 0 10px #22c55e" : "none" }}></div>
              <span style={{ fontSize: "14px", fontWeight: "600", color: isListening ? "#166534" : "#71717a" }}>
                {isListening ? "Subscribed to Live Node Responses..." : "Offline - Broadcast to Connect"}
              </span>
            </div>
            
            {liveResults.length === 0 && isListening && (
              <div style={{ textAlign: "center", marginTop: "50px" }}>
                <div style={{ marginBottom: "10px" }}>🌀</div>
                <p style={{ color: "#71717a", fontSize: "14px", fontStyle: "italic" }}>
                  Orchestrating computation across decentralized nodes...
                </p>
              </div>
            )}
            
            {/* The Results Loop - UPDATED DATA MAPPING */}
            {liveResults.map((result, i) => {
              // 🛡️ MAPPING FIX: Uses 'count' and 'hospital' from your actual backend log.
              const countValue = result.count ?? result.patient_count ?? "0";
              const hospitalLabel = result.hospital ?? result.hospital_name ?? "Unknown Node";
              const proofHash = result.execution_proof ?? result.proof ?? "ZKP Signature Pending";

              return (
                <div key={i} style={{ border: "1px solid #e4e4e7", padding: "15px", marginBottom: "15px", background: "white", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "18px" }}>🏥</span>
                    <h4 style={{ margin: 0, fontSize: "15px" }}>{hospitalLabel}</h4>
                  </div>
                  
                  <div style={{ background: "#f0f9ff", borderLeft: "4px solid #0ea5e9", padding: "12px", borderRadius: "2px" }}>
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: "500", color: "#0369a1" }}>
                      Count: <strong>{countValue}</strong> patients found
                    </p>
                  </div>
                  
                  <details style={{ marginTop: "12px", background: "#f8fafc", padding: "8px", borderRadius: "4px" }}>
                    <summary style={{ fontSize: "12px", color: "#6366f1", cursor: "pointer", fontWeight: "bold" }}>
                      Technical Proof & Payload
                    </summary>
                    <div style={{ marginTop: "10px" }}>
                      <p style={{ fontSize: "11px", fontWeight: "bold", margin: "0 0 4px 0" }}>ZKP Hash:</p>
                      <code style={{ fontSize: "10px", display: "block", background: "#e2e8f0", padding: "4px", borderRadius: "2px", wordBreak: "break-all" }}>
                        {proofHash}
                      </code>
                      <p style={{ fontSize: "11px", fontWeight: "bold", margin: "10px 0 4px 0" }}>Raw Wire JSON:</p>
                      <pre style={{ fontSize: "9px", margin: 0, overflowX: "auto", background: "#0f172a", color: "#94a3b8", padding: "8px", borderRadius: "4px" }}>
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}
