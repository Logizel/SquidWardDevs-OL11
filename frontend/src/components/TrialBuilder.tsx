// src/components/TrialBuilder.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveTrial, broadcastTrial } from "../api/trial";

export default function TrialBuilder() {
  const navigate = useNavigate();
  
  // Metadata State
  const [trialName, setTrialName] = useState("Project Aegis Phase II");
  const [targetDisease, setTargetDisease] = useState("Type 2 Diabetes");
  const [diseaseCode, setDiseaseCode] = useState("E11");
  const [phase, setPhase] = useState("Phase II");

  // Dynamic Rules State
  const [rules, setRules] = useState<any[]>([]);

  // Add a new blank rule block
  const addRule = (type: string) => {
    if (type === "demographics") {
      setRules([...rules, { id: Date.now(), type, min_age: 18, max_age: 100, gender: "Any" }]);
    } else if (type === "inclusion" || type === "exclusion") {
      setRules([...rules, { id: Date.now(), type, condition: "" }]);
    }
  };

  // Update a specific rule by its index
  const updateRule = (index: number, key: string, value: any) => {
    const newRules = [...rules];
    newRules[index][key] = value;
    setRules(newRules);
  };

  // Remove a rule
  const deleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  // Map the raw frontend state to the strict Backend Pydantic schema
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
    });

    return {
      name: trialName,
      phase: phase,
      target_disease_name: targetDisease,
      target_disease_code: diseaseCode,
      criteria: formattedCriteria,
    };
  };

  // The 2-Step Execution: Save -> Broadcast
  const handleBroadcast = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No authentication token found. Please log in.");
      navigate("/login");
      return;
    }

    const payload = buildPayload();

    try {
      // Step 1: Save to DB
      console.log("1. Saving to database...", payload);
      const savedTrial = await saveTrial(token, payload);
      const trialId = savedTrial.id;
      
      // Step 2: Broadcast to Edge Nodes
      console.log(`2. Broadcasting Trial ID: ${trialId}`);
      await broadcastTrial(token, trialId);
      
      alert("Success! Trial broadcasted to the Edge Network.");
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div>
      <h2>Sponsor Dashboard: Trial Builder</h2>
      <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>Logout</button>
      <hr />

      <div style={{ display: "flex", gap: "20px" }}>
        {/* LEFT COLUMN: THE BUILDER */}
        <div style={{ flex: 1 }}>
          <fieldset>
            <legend>1. Trial Metadata</legend>
            <label>Trial Name: <input value={trialName} onChange={e => setTrialName(e.target.value)} /></label><br/>
            <label>Phase: 
              <select value={phase} onChange={e => setPhase(e.target.value)}>
                <option>Phase I</option>
                <option>Phase II</option>
                <option>Phase III</option>
              </select>
            </label><br/>
            <label>Disease Name: <input value={targetDisease} onChange={e => setTargetDisease(e.target.value)} /></label><br/>
            <label>ICD-10 Code: <input value={diseaseCode} onChange={e => setDiseaseCode(e.target.value)} /></label><br/>
          </fieldset>
          <br/>

          <fieldset>
            <legend>2. Criteria Rules</legend>
            <button onClick={() => addRule("demographics")}>+ Add Demographics</button> 
            <button onClick={() => addRule("inclusion")}>+ Add Inclusion (Must Have)</button> 
            <button onClick={() => addRule("exclusion")}>+ Add Exclusion (Must NOT Have)</button>
            <br/><br/>

            {rules.map((rule, index) => (
              <div key={rule.id} style={{ border: "1px solid black", padding: "10px", marginBottom: "10px" }}>
                <strong>{rule.type.toUpperCase()} RULE</strong> <button onClick={() => deleteRule(index)}>Delete</button>
                <br/>
                
                {rule.type === "demographics" && (
                  <>
                    <label>Min Age: <input type="number" value={rule.min_age} onChange={e => updateRule(index, "min_age", e.target.value)} /></label><br/>
                    <label>Max Age: <input type="number" value={rule.max_age} onChange={e => updateRule(index, "max_age", e.target.value)} /></label><br/>
                    <label>Gender: 
                      <select value={rule.gender} onChange={e => updateRule(index, "gender", e.target.value)}>
                        <option>Any</option><option>Male</option><option>Female</option>
                      </select>
                    </label>
                  </>
                )}

                {(rule.type === "inclusion" || rule.type === "exclusion") && (
                  <>
                    <label>ICD-10 Condition Code: <input placeholder="e.g. E11" value={rule.condition} onChange={e => updateRule(index, "condition", e.target.value)} /></label>
                  </>
                )}
              </div>
            ))}
          </fieldset>

          <br/>
          <button onClick={handleBroadcast} style={{ padding: "10px", fontSize: "16px", cursor: "pointer" }}>
            🚀 Save & Broadcast to Edge Network
          </button>
        </div>

        {/* RIGHT COLUMN: LIVE PAYLOAD PREVIEW */}
        <div style={{ flex: 1, borderLeft: "2px solid #ccc", paddingLeft: "20px" }}>
          <h3>Live JSON Payload Preview</h3>
          <p><i>This is exactly what gets sent to the FastAPI Backend:</i></p>
          <pre style={{ background: "#eee", padding: "10px" }}>
            {JSON.stringify(buildPayload(), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
