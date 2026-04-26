// src/components/HospitalDashboard.tsx
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
        // 🔥 Now fetching REAL data from the /hospital/queries endpoint
        const data = await getIncomingQueries(token);
        setQueries(data);
        setError(""); // Clear any previous connection errors
      } catch (err: any) {
        console.error("Audit Trail Connection Error:", err.message);
        setError("Unable to sync with Cloud Hub. Please check backend logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Auto-refresh every 10 seconds to catch new Redis broadcasts
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

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>🔐 Accessing Secure Hospital Enclave...</div>;

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>🏥 Hospital Edge: Compliance & Audit</h2>
        <button 
          onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
          style={{ padding: "8px 16px", cursor: "pointer", background: "#333", color: "white", border: "none", borderRadius: "4px" }}
        >
          Secure Logout
        </button>
      </div>
      <hr />

      {error && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "15px", borderRadius: "6px", marginBottom: "20px", border: "1px solid #f87171" }}>
          <strong>Connection Alert:</strong> {error}
        </div>
      )}

      <h3>📥 Incoming Sponsor Queries (Audit Trail)</h3>
      <p style={{ color: "#666" }}>Monitoring real-time AST Parser execution and Differential Privacy fuzzing.</p>

      {queries.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", border: "2px dashed #ccc", borderRadius: "8px", color: "#888" }}>
          No sponsor queries have hit this node yet.
        </div>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {queries.map((query) => (
            <li key={query.id} style={{ border: "1px solid #e5e7eb", padding: "20px", marginBottom: "20px", borderRadius: "8px", background: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <strong style={{ fontSize: "18px" }}>Sponsor: {query.sponsor}</strong>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>Query ID: {query.id}</div>
                </div>
                <span style={{ 
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  background: query.status === "Blocked" ? "#fef2f2" : "#f0fdf4",
                  color: query.status === "Blocked" ? "#991b1b" : "#166534",
                  border: `1px solid ${query.status === "Blocked" ? "#fecaca" : "#bbf7d0"}`,
                  fontWeight: "bold"
                }}>
                  {query.status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                <div style={{ flex: 1, padding: "15px", background: "#f9fafb", borderRadius: "6px" }}>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>True Local Count</div>
                  <div style={{ fontSize: "24px", fontWeight: "bold" }}>{query.true_count}</div>
                </div>
                <div style={{ flex: 1, padding: "15px", background: "#f0f9ff", borderRadius: "6px", borderLeft: "4px solid #0ea5e9" }}>
                  <div style={{ fontSize: "12px", color: "#0369a1", marginBottom: "5px" }}>Fuzzed Output (Sponsor Sees)</div>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#0369a1" }}>{query.fuzzed_count}</div>
                </div>
              </div>

              {query.true_count < 5 && query.fuzzed_count === 0 && (
                <div style={{ marginTop: "15px", padding: "10px", background: "#fff1f2", color: "#e11d48", borderRadius: "4px", fontSize: "13px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🚨</span> K-Anonymity Shield Activated: True count below threshold. Result suppressed.
                </div>
              )}

              <details style={{ marginTop: "20px" }}>
                <summary style={{ cursor: "pointer", color: "#6366f1", fontSize: "14px", fontWeight: "600" }}>
                  Technical Audit (SQL & ZKP Proof)
                </summary>
                <div style={{ background: "#111827", color: "#94a3b8", padding: "15px", marginTop: "10px", borderRadius: "6px", fontSize: "12px", overflowX: "auto" }}>
                  <p style={{ color: "#e2e8f0", fontWeight: "bold", marginBottom: "5px" }}>Executed SQL:</p>
                  <code style={{ color: "#38bdf8" }}>{query.sql_query}</code>
                  <br /><br />
                  <p style={{ color: "#e2e8f0", fontWeight: "bold", marginBottom: "5px" }}>Execution Proof Hash:</p>
                  <code>{query.execution_proof}</code>
                </div>
              </details>

              {query.needs_approval && (
                <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee" }}>
                  <p style={{ fontSize: "14px", marginBottom: "12px" }}>
                    <strong>Action Required:</strong> Sponsor has requested a full Data Use Agreement (DUA) to proceed.
                  </p>
                  <button 
                    onClick={() => handleApprove(query.id)}
                    style={{ width: "100%", padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                  >
                    Sign & Approve DUA
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
