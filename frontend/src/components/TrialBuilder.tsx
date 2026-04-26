// src/components/TrialBuilder.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveTrial, broadcastTrial } from "../api/trial";

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

  // Adds a new blank rule to the list based on the chosen category
  const addRule = (type: string) => {
    if (type === "demographics") {
      setRules([...rules, { id: Date.now(), type, min_age: 18, max_age: 100, gender: "Any" }]);
    } else if (type === "inclusion" || type === "exclusion") {
      setRules([...rules, { id: Date.now(), type, condition: "" }]);
    }
  };

  // Updates a specific property of a rule without mutating the rest
  const updateRule = (index: number, key: string, value: any) => {
    const newRules = [...rules];
    newRules[index][key] = value;
    setRules(newRules);
  };

  // Deletes a rule from the list
  const deleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  // --- Payload Formatter ---

  // This maps the messy, flat React state into the exact nested, strict
  // JSON structure that your FastAPI Pydantic models and AST Parser demand.
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
    }).filter(Boolean); // Removes any nulls from empty mappings

    return {
      name: trialName,
      description: description,
      phase: phase,
      target_disease_name: targetDisease,
      target_disease_code: diseaseCode,
      criteria: formattedCriteria,
    };
  };

  // --- The Master Execution Flow ---

  const handleBroadcast = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No authentication token found. Please log in.");
      navigate("/login");
      return;
    }

    try {
      // STEP 1: Form the payload and save it to the PostgreSQL Database
      const payload = buildPayload();
      console.log("1. Saving to database...", payload);
      const savedTrial = await saveTrial(token, payload);
      const trialId = savedTrial.id;
      
      // STEP 2: Open a WebSocket tube to the Hub Orchestrator
      const wsUrl = `ws://localhost:8000/api/v1/orchestrator/ws/${trialId}`;
      console.log(`2. Connecting to WebSocket: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsListening(true);
        setLiveResults([]); // Clear previous results on new broadcast
        console.log("📡 Connected to Hub WebSocket! Ready for Edge Node data.");
      };

      // When the Hub receives a Redis message, it pushes it here instantly
      ws.onmessage = (event) => {
        const incomingData = JSON.parse(event.data);
        console.log("📥 Received Edge Node Data:", incomingData);
        setLiveResults((prev) => [...prev, incomingData]);
      };

      ws.onclose = () => {
        setIsListening(false);
        console.log("WebSocket connection closed.");
      };

      ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      // STEP 3: Tell the Hub to Broadcast the saved Trial across Redis
      console.log(`3. Broadcasting Trial ID to Edge Nodes: ${trialId}`);
      await broadcastTrial(token, trialId);
      
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Sponsor Dashboard: Trial Builder & Orchestrator</h2>
        <button 
          onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
          style={{ padding: "8px 16px", cursor: "pointer", background: "#ff4d4f", color: "white", border: "none", borderRadius: "4px" }}
        >
          Secure Logout
        </button>
      </div>
      <hr style={{ margin: "20px 0" }} />

      {/* Main 3-Column Layout */}
      <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>
        
        {/* =================================================================== */}
        {/* COLUMN 1: THE BUILDER UI */}
        {/* =================================================================== */}
        <div style={{ flex: 1, minWidth: "350px" }}>
          
          {/* Metadata Form */}
          <fieldset style={{ padding: "15px", background: "#fafafa", borderRadius: "8px" }}>
            <legend style={{ fontWeight: "bold" }}>1. Trial Metadata</legend>
            <div style={{ marginBottom: "10px" }}>
              <label>Trial Name: <br/>
                <input style={{ width: "95%", padding: "5px" }} value={trialName} onChange={e => setTrialName(e.target.value)} />
              </label>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Phase: <br/>
                <select style={{ width: "95%", padding: "5px" }} value={phase} onChange={e => setPhase(e.target.value)}>
                  <option>Phase I</option>
                  <option>Phase II</option>
                  <option>Phase III</option>
                  <option>Phase IV</option>
                </select>
              </label>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Target Disease Name: <br/>
                <input style={{ width: "95%", padding: "5px" }} value={targetDisease} onChange={e => setTargetDisease(e.target.value)} />
              </label>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>ICD-10 Code: <br/>
                <input style={{ width: "95%", padding: "5px" }} value={diseaseCode} onChange={e => setDiseaseCode(e.target.value)} />
              </label>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Description: <br/>
                <textarea rows={3} style={{ width: "95%", padding: "5px" }} value={description} onChange={e => setDescription(e.target.value)} />
              </label>
            </div>
          </fieldset>
          <br/>

          {/* Rule Engine */}
          <fieldset style={{ padding: "15px", background: "#fafafa", borderRadius: "8px" }}>
            <legend style={{ fontWeight: "bold" }}>2. Criteria Rule Engine</legend>
            
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
              <button onClick={() => addRule("demographics")} style={{ cursor: "pointer", padding: "5px 10px" }}>+ Add Demographics</button> 
              <button onClick={() => addRule("inclusion")} style={{ cursor: "pointer", padding: "5px 10px", color: "green" }}>+ Add Inclusion (Must Have)</button> 
              <button onClick={() => addRule("exclusion")} style={{ cursor: "pointer", padding: "5px 10px", color: "red" }}>+ Add Exclusion (Must NOT Have)</button>
            </div>

            {rules.map((rule, index) => (
              <div key={rule.id} style={{ border: "1px solid #ccc", padding: "15px", marginBottom: "15px", background: "white", borderRadius: "4px", position: "relative" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <strong style={{ 
                    color: rule.type === "exclusion" ? "red" : rule.type === "inclusion" ? "green" : "black" 
                  }}>
                    {rule.type.toUpperCase()} RULE
                  </strong>
                  <button onClick={() => deleteRule(index)} style={{ cursor: "pointer", background: "transparent", border: "1px solid red", color: "red" }}>Delete</button>
                </div>
                
                {rule.type === "demographics" && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <label>Min Age: <br/><input type="number" style={{ width: "60px" }} value={rule.min_age} onChange={e => updateRule(index, "min_age", e.target.value)} /></label>
                    <label>Max Age: <br/><input type="number" style={{ width: "60px" }} value={rule.max_age} onChange={e => updateRule(index, "max_age", e.target.value)} /></label>
                    <label>Gender: <br/>
                      <select value={rule.gender} onChange={e => updateRule(index, "gender", e.target.value)}>
                        <option>Any</option><option>Male</option><option>Female</option>
                      </select>
                    </label>
                  </div>
                )}

                {(rule.type === "inclusion" || rule.type === "exclusion") && (
                  <div>
                    <label>ICD-10 Condition Code: <br/>
                      <input style={{ width: "90%", padding: "5px", marginTop: "5px" }} placeholder="e.g. E11, I50.1" value={rule.condition} onChange={e => updateRule(index, "condition", e.target.value)} />
                    </label>
                  </div>
                )}
              </div>
            ))}
          </fieldset>

          <br/>
          <button 
            onClick={handleBroadcast} 
            style={{ width: "100%", padding: "15px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", backgroundColor: "#111", color: "white", border: "none", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
          >
            🚀 Save & Broadcast to Edge Network
          </button>
        </div>

        {/* =================================================================== */}
        {/* COLUMN 2: LIVE JSON PAYLOAD PREVIEW */}
        {/* =================================================================== */}
        <div style={{ flex: 1, borderLeft: "2px solid #eaeaea", paddingLeft: "20px", minWidth: "300px" }}>
          <h3 style={{ marginTop: 0 }}>Live JSON Payload Preview</h3>
          <p style={{ fontSize: "14px", color: "#666" }}>This is exactly what gets validated by Pydantic and saved to PostgreSQL.</p>
          <pre style={{ background: "#282c34", color: "#abb2bf", padding: "15px", overflowX: "auto", borderRadius: "8px", fontSize: "13px" }}>
            {JSON.stringify(buildPayload(), null, 2)}
          </pre>
        </div>

        {/* =================================================================== */}
        {/* COLUMN 3: LIVE EDGE NODE RESULTS (WEBSOCKET) */}
        {/* =================================================================== */}
        <div style={{ flex: 1, borderLeft: "2px solid #eaeaea", paddingLeft: "20px", minWidth: "300px" }}>
          
          <div style={{ backgroundColor: isListening ? "#f0fdf4" : "#f8f9fa", padding: "20px", border: "1px solid", borderColor: isListening ? "#bbf7d0" : "#e5e7eb", borderRadius: "8px", transition: "all 0.3s ease" }}>
            <h3 style={{ marginTop: 0 }}>📡 Live Edge Network Results</h3>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: isListening ? "#22c55e" : "#9ca3af", boxShadow: isListening ? "0 0 8px #22c55e" : "none" }}></div>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: isListening ? "#166534" : "#4b5563" }}>
                {isListening ? "Listening for cryptographically verified responses..." : "WebSocket idle. Awaiting broadcast."}
              </span>
            </div>
            
            {liveResults.length === 0 && isListening && (
              <p style={{ color: "#666", fontSize: "14px", fontStyle: "italic" }}>
                Waiting for Edge Nodes to execute AST parsing and apply Differential Privacy math...
              </p>
            )}
            
            {/* Map over the results coming in from Redis via WebSocket */}
            {liveResults.map((result, i) => {
              // 🛡️ Bulletproof Fallbacks: Catch the data no matter what the backend named it!
              const count = result.patient_count ?? result.noisy_patient_count ?? "0";
              const proof = result.execution_proof ?? result.proof ?? "No proof attached";
              const hospitalName = result.hospital_name ?? "Unknown Hospital Node";

              return (
                <div key={i} style={{ border: "1px solid #d1d5db", padding: "15px", marginTop: "15px", background: "white", borderRadius: "6px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "20px" }}>🏥</span>
                    <h4 style={{ margin: 0, color: "#111827" }}>{hospitalName}</h4>
                  </div>
                  
                  <div style={{ background: "#eff6ff", borderLeft: "4px solid #3b82f6", padding: "10px", marginBottom: "15px" }}>
                    <p style={{ margin: 0, fontSize: "15px", color: "#1e3a8a" }}>
                      ✅ Found <strong>{count}</strong> matching patients (Fuzzed via K-Anonymity)
                    </p>
                  </div>
                  
                  <details style={{ background: "#f9fafb", padding: "10px", borderRadius: "4px", border: "1px dashed #d1d5db" }}>
                    <summary style={{ fontSize: "13px", color: "#4f46e5", cursor: "pointer", fontWeight: "bold", outline: "none" }}>
                      View ZKP Execution Proof & Raw JSON
                    </summary>
                    
                    <div style={{ marginTop: "15px" }}>
                      <p style={{ fontSize: "12px", color: "#374151", margin: "0 0 5px 0", fontWeight: "bold" }}>Cryptographic Hash:</p>
                      <p style={{ fontSize: "11px", wordBreak: "break-all", fontFamily: "monospace", margin: "0 0 15px 0", background: "#e5e7eb", padding: "5px", borderRadius: "2px" }}>
                        {proof}
                      </p>
                      
                      <p style={{ fontSize: "12px", color: "#374151", margin: "0 0 5px 0", fontWeight: "bold" }}>Raw JSON Payload:</p>
                      <pre style={{ fontSize: "10px", margin: 0, overflowX: "auto", background: "#1f2937", color: "#f3f4f6", padding: "10px", borderRadius: "4px" }}>
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
