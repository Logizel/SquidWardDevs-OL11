import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIncomingQueries, approveAgreement } from "../api/hospital";

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const data = await getIncomingQueries(token);
        setQueries(data);
        setError(""); 
      } catch (err: any) {
        console.error("Audit Trail Connection Error:", err.message);
        setError("Unable to sync with Cloud Hub. Please check backend logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleApprove = async (queryId: string) => {
    const token = localStorage.getItem("token");
    try {
      await approveAgreement(token!, queryId);
      alert("Agreement securely signed. Trial phase authorized.");
      setQueries(queries.map(q => q.id === queryId ? { ...q, needs_approval: false, status: "Approved" } : q));
    } catch (err: any) {
      alert("Authorization Error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center animate-pulse">
          <svg className="w-12 h-12 text-blue-500 mb-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-gray-400 font-bold tracking-wide">Accessing Secure Enclave...</p>
        </div>
      </div>
    );
  }

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

      {/* Ambient Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="bg-[#111111]/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-6 mb-8 flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Compliance & Audit</h1>
              <p className="text-sm font-medium text-gray-400">Monitor local Edge Node execution and Privacy Engine metrics</p>
            </div>
          </div>
          <button 
            onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
            className="px-6 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-sm rounded-xl hover:bg-red-500/20 transition-all shadow-lg"
          >
            Secure Logout
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500/30 text-red-300 text-sm font-semibold rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            Incoming Sponsor Queries
          </h3>
          <span className="flex items-center gap-2 text-xs font-bold bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.15)]">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Live Monitoring
          </span>
        </div>

        {/* Empty State */}
        {queries.length === 0 ? (
          <div className="bg-[#111111]/60 backdrop-blur-md rounded-3xl border border-gray-800 p-16 text-center shadow-lg relative overflow-hidden group hover:border-gray-700 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            <h3 className="text-white font-bold text-lg mb-1 relative z-10">No Queries Detected</h3>
            <p className="text-gray-500 text-sm font-medium relative z-10">Waiting for trial broadcasts from the Hub network.</p>
          </div>
        ) : (
          <ul className="space-y-6">
            {queries.map((query) => (
              <li key={query.id} className="bg-[#111111]/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 transition-all hover:border-gray-700 hover:shadow-[0_0_30px_rgba(59,130,246,0.05)] animate-in fade-in slide-in-from-bottom-4 relative overflow-hidden">
                
                {/* Sponsor Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <div>
                    <strong className="text-xl font-extrabold text-white block">{query.sponsor}</strong>
                    <span className="text-xs text-gray-500 font-mono mt-1 flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {query.id}
                    </span>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-lg ${
                    query.status === "Blocked" ? "bg-red-500/10 text-red-400 border border-red-500/20" : 
                    query.status === "Approved" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                    "bg-green-500/10 text-green-400 border border-green-500/20"
                  }`}>
                    {query.status === "Blocked" && <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>}
                    {query.status === "Approved" && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                    {query.status !== "Blocked" && query.status !== "Approved" && <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>}
                    {query.status}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 relative z-10">
                  <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800 shadow-inner">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                      True Local Count
                    </div>
                    <div className="text-4xl font-black text-white tracking-tight">{query.true_count}</div>
                  </div>
                  
                  <div className="bg-blue-900/10 rounded-2xl p-6 border border-blue-500/20 shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
                    <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Fuzzed Output (Sponsor Sees)
                    </div>
                    <div className="text-4xl font-black text-blue-100 tracking-tight relative z-10">{query.fuzzed_count}</div>
                  </div>
                </div>

                {/* K-Anonymity Warning */}
                {query.true_count < 5 && query.fuzzed_count === 0 && (
                  <div className="mb-8 p-4 bg-red-900/20 text-red-300 rounded-xl text-sm font-bold flex items-center gap-3 border border-red-500/20 shadow-inner">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    K-Anonymity Shield Activated: True count below threshold. Result safely suppressed.
                  </div>
                )}

                {/* Technical Audit Dropdown */}
                <details className="group bg-[#161616] rounded-2xl border border-gray-800 overflow-hidden">
                  <summary className="p-5 cursor-pointer text-sm font-bold text-gray-300 outline-none list-none flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Technical Audit (SQL & ZKP Proof)
                    </span>
                    <span className="group-open:rotate-180 transition-transform text-gray-500">▼</span>
                  </summary>
                  <div className="p-5 border-t border-gray-800 bg-[#0c0c0c]">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Executed SQL</p>
                        <code className="text-[11px] text-blue-300/80 font-mono block bg-blue-900/10 p-4 rounded-xl border border-blue-500/10 leading-relaxed shadow-inner">
                          {query.sql_query}
                        </code>
                      </div>
                      
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Execution Proof Hash</p>
                        <code className="text-[11px] text-emerald-400/80 font-mono break-all block bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/10 shadow-inner">
                          {query.execution_proof}
                        </code>
                      </div>
                    </div>
                  </div>
                </details>

                {/* Pending Approval Action */}
                {query.needs_approval && (
                  <div className="mt-8 pt-6 border-t border-gray-800 relative z-10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-800/30 p-4 rounded-2xl border border-gray-700/50">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-gray-400 font-medium">
                          <strong className="text-white">Action Required:</strong> Sponsor has requested a Data Use Agreement (DUA).
                        </p>
                      </div>
                      <button 
                        onClick={() => handleApprove(query.id)}
                        className="w-full sm:w-auto bg-white text-black px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 focus:ring-4 focus:ring-gray-500 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] whitespace-nowrap"
                      >
                        Sign & Approve DUA
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
