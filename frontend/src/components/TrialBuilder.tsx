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

  // --- The Master Execution Flow ---
  const handleBroadcast = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No authentication token found. Please log in.");
      navigate("/login");
      return;
    }

    try {
      const payload = buildPayload();
      const savedTrial = await saveTrial(token, payload);
      const trialId = savedTrial.id;
      
      const wsUrl = `ws://localhost:8000/api/v1/orchestrator/ws/${trialId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsListening(true);
        setLiveResults([]);
      };

      ws.onmessage = (event) => {
        const incomingData = JSON.parse(event.data);
        setLiveResults((prev) => [...prev, incomingData]);
      };

      ws.onclose = () => setIsListening(false);
      ws.onerror = (error) => console.error("WebSocket Error:", error);

      await broadcastTrial(token, trialId);
      
    } catch (error: any) {
      alert("Execution Failed: " + error.message);
    }
  };

  // Reusable styling classes for the dark theme
  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-800 bg-[#0a0a0a] text-white placeholder-gray-600 focus:bg-[#161616] focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all duration-200 font-medium";
  const labelClass = "text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1.5 pl-1";
  const cardClass = "bg-[#111111]/80 backdrop-blur-xl rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.3)] border border-gray-800 p-8";

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans p-4 sm:p-8 text-gray-100 relative overflow-hidden">
      
      {/* Immersive Grid Background Effect */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
        }}
      ></div>

      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 max-w-screen-2xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-[#111111]/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-6 mb-8 flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Federated Orchestrator</h1>
              <p className="text-sm font-medium text-gray-400">Build, encrypt, and broadcast criteria to the Edge Network</p>
            </div>
          </div>
          <button 
            onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
            className="px-6 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-sm rounded-xl hover:bg-red-500/20 transition-all shadow-lg"
          >
            Secure Logout
          </button>
        </div>

        {/* 3-Column Workspace */}
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          
          {/* =================================================================== */}
          {/* COLUMN 1: THE BUILDER UI */}
          {/* =================================================================== */}
          <div className="w-full xl:w-[40%] space-y-6">
            
            {/* Metadata Form */}
            <div className={cardClass}>
              <h3 className="text-lg font-extrabold mb-6 flex items-center gap-3 text-white">
                <span className="bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-lg text-sm border border-blue-500/30">1</span> 
                Trial Metadata
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Trial Name</label>
                  <input className={inputClass} value={trialName} onChange={e => setTrialName(e.target.value)} />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex-1">
                    <label className={labelClass}>Phase</label>
                    <select className={`${inputClass} appearance-none cursor-pointer`} value={phase} onChange={e => setPhase(e.target.value)}>
                      <option>Phase I</option>
                      <option>Phase II</option>
                      <option>Phase III</option>
                      <option>Phase IV</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>ICD-10 Code</label>
                    <input className={inputClass} value={diseaseCode} onChange={e => setDiseaseCode(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Target Disease Name</label>
                  <input className={inputClass} value={targetDisease} onChange={e => setTargetDisease(e.target.value)} />
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea rows={3} className={`${inputClass} resize-none`} value={description} onChange={e => setDescription(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Rule Engine */}
            <div className={cardClass}>
              <h3 className="text-lg font-extrabold mb-6 flex items-center gap-3 text-white">
                <span className="bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-lg text-sm border border-blue-500/30">2</span> 
                Criteria Rule Engine
              </h3>
              
              <div className="flex flex-wrap gap-3 mb-8">
                <button onClick={() => addRule("demographics")} className="px-4 py-2.5 bg-gray-800 text-gray-300 border border-gray-700 text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Demographics
                </button> 
                <button onClick={() => addRule("inclusion")} className="px-4 py-2.5 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-green-500/20 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Inclusion
                </button> 
                <button onClick={() => addRule("exclusion")} className="px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Exclusion
                </button>
              </div>

              <div className="space-y-4">
                {rules.map((rule, index) => (
                  <div key={rule.id} className="border border-gray-800 p-5 rounded-2xl bg-[#0a0a0a]/50 relative animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-5">
                      <span className={`text-[10px] font-extrabold tracking-widest px-3 py-1.5 rounded-lg uppercase flex items-center gap-1.5 ${
                        rule.type === "exclusion" ? "bg-red-500/10 text-red-400 border border-red-500/20" : 
                        rule.type === "inclusion" ? "bg-green-500/10 text-green-400 border border-green-500/20" : 
                        "bg-gray-800 text-gray-300 border border-gray-700"
                      }`}>
                        {rule.type === "exclusion" && <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>}
                        {rule.type === "inclusion" && <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>}
                        {rule.type === "demographics" && <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>}
                        {rule.type} Rule
                      </span>
                      <button onClick={() => deleteRule(index)} className="text-gray-500 hover:text-red-400 text-sm font-bold transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    
                    {rule.type === "demographics" && (
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <label className={labelClass}>Min Age</label>
                          <input type="number" className={inputClass} value={rule.min_age} onChange={e => updateRule(index, "min_age", e.target.value)} />
                        </div>
                        <div className="flex-1">
                          <label className={labelClass}>Max Age</label>
                          <input type="number" className={inputClass} value={rule.max_age} onChange={e => updateRule(index, "max_age", e.target.value)} />
                        </div>
                        <div className="flex-1">
                          <label className={labelClass}>Gender</label>
                          <select className={`${inputClass} appearance-none cursor-pointer`} value={rule.gender} onChange={e => updateRule(index, "gender", e.target.value)}>
                            <option>Any</option><option>Male</option><option>Female</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {(rule.type === "inclusion" || rule.type === "exclusion") && (
                      <div>
                        <label className={labelClass}>ICD-10 Condition Code</label>
                        <input className={inputClass} placeholder="e.g. E11, I50.1" value={rule.condition} onChange={e => updateRule(index, "condition", e.target.value)} />
                      </div>
                    )}
                  </div>
                ))}
                {rules.length === 0 && (
                  <div className="text-center p-10 border border-dashed border-gray-800 rounded-2xl bg-[#0a0a0a]/30">
                    <svg className="w-8 h-8 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    <p className="text-gray-500 font-medium text-sm tracking-wide">No criteria rules defined yet.</p>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleBroadcast} 
              className="w-full bg-white text-black py-4 rounded-2xl font-extrabold text-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-500/50 transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex justify-center items-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
              Save & Broadcast to Edge Network
            </button>
          </div>

          {/* =================================================================== */}
          {/* COLUMN 2: LIVE JSON PAYLOAD PREVIEW */}
          {/* =================================================================== */}
          <div className="w-full xl:w-[30%]">
            <div className={`${cardClass} h-full flex flex-col`}>
              <h3 className="text-lg font-extrabold mb-2 text-white">Payload Inspection</h3>
              <p className="text-sm text-gray-500 font-medium mb-6">Real-time serialization of AST criteria objects.</p>
              <div className="bg-[#050505] rounded-2xl p-6 overflow-x-auto border border-gray-800 flex-grow shadow-inner">
                <pre className="text-blue-300/80 font-mono text-[11px] leading-relaxed">
                  {JSON.stringify(buildPayload(), null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* COLUMN 3: LIVE EDGE NODE RESULTS (WEBSOCKET) */}
          {/* =================================================================== */}
          <div className="w-full xl:w-[30%]">
            <div className={`${cardClass} transition-colors duration-500 min-h-[600px] ${
              isListening ? "border-green-500/30 bg-[#111111]/90 shadow-[0_0_30px_rgba(34,197,94,0.05)]" : ""
            }`}>
              <h3 className="text-lg font-extrabold mb-6 text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Live Edge Network
              </h3>
              
              <div className="flex items-center gap-3 mb-8 bg-[#0a0a0a] p-4 rounded-xl border border-gray-800 shadow-inner">
                <div className="relative flex h-3 w-3 shrink-0">
                  {isListening && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isListening ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" : "bg-gray-600"}`}></span>
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${isListening ? "text-green-400" : "text-gray-500"}`}>
                  {isListening ? "Listening for verified responses..." : "Awaiting broadcast."}
                </span>
              </div>
              
              {liveResults.length === 0 && isListening && (
                <div className="text-center mt-20">
                  <svg className="w-10 h-10 text-gray-600 mx-auto mb-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-500 text-sm font-medium">Executing AST parsing and applying Differential Privacy math...</p>
                </div>
              )}
              
              <div className="space-y-4">
                {liveResults.map((result, i) => {
                  const countValue = result.count ?? result.patient_count ?? "0";
                  const hospitalLabel = result.hospital ?? result.hospital_name ?? "Unknown Node";
                  const proofHash = result.execution_proof ?? result.proof ?? "ZKP Signature Pending";

                  return (
                    <div key={i} className="border border-gray-800 p-6 bg-[#0a0a0a]/80 rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <h4 className="m-0 font-extrabold text-white text-lg">{hospitalLabel}</h4>
                      </div>
                      
                      <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl mb-5 shadow-inner">
                        <p className="m-0 text-sm font-bold text-blue-300 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Found <span className="text-xl font-black text-white px-1">{countValue}</span> matching patients
                        </p>
                        <p className="text-[11px] text-blue-400/60 mt-1.5 font-medium uppercase tracking-widest pl-7">(Fuzzed via K-Anonymity)</p>
                      </div>
                      
                      <details className="group">
                        <summary className="text-[11px] text-gray-400 cursor-pointer font-bold uppercase tracking-widest outline-none list-none flex items-center gap-2 hover:text-white transition-colors">
                          <span className="group-open:rotate-90 transition-transform">▶</span> Technical Proof & Payload
                        </summary>
                        <div className="mt-5 space-y-4 border-t border-gray-800 pt-4">
                          <div>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1.5">ZKP Hash</p>
                            <code className="text-[10px] block bg-[#050505] border border-gray-800 p-3 rounded-lg break-all text-emerald-400/80 font-mono shadow-inner">
                              {proofHash}
                            </code>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1.5">Raw Wire JSON</p>
                            <pre className="text-[10px] m-0 overflow-x-auto bg-[#050505] border border-gray-800 text-gray-400 p-3 rounded-lg font-mono shadow-inner">
                              {JSON.stringify(result, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </details>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
