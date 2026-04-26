// src/components/HospitalDashboard.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIncomingQueries, approveAgreement } from "../api/hospital";

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch data when the dashboard loads
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
      } catch (err: any) {
        // Fallback mock data in case the backend endpoint isn't built yet
        console.warn("Backend endpoint missing or failed, loading mock audit trail.");
        setError("Warning: Showing local audit logs. Cloud Hub connection failed.");
        setQueries([
          {
            id: "q-123",
            sponsor: "Novartis Oncology",
            status: "K-Anonymity Blocked",
            true_count: 1,
            fuzzed_count: 0,
            sql_query: "SELECT count(distinct id) FROM patients WHERE age > 25 AND condition = 'C50.9'",
            execution_proof: "proof_8f7b2a9c1d3...",
            needs_approval: false
          },
          {
            id: "q-456",
            sponsor: "Project Aegis Phase II",
            status: "Responded",
            true_count: 42,
            fuzzed_count: 45,
            sql_query: "SELECT count(distinct id) FROM patients WHERE age > 18 AND condition = 'E11'",
            execution_proof: "proof_99b2c11x8z...",
            needs_approval: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleApprove = async (queryId: string) => {
    const token = localStorage.getItem("token");
    try {
      await approveAgreement(token!, queryId);
      alert("Agreement securely signed and sent to Sponsor.");
      // Refresh the list locally
      setQueries(queries.map(q => q.id === queryId ? { ...q, needs_approval: false } : q));
    } catch (err: any) {
      alert("Error approving agreement: " + err.message);
    }
  };

  if (loading) return <p>Loading secure hospital enclave...</p>;

  return (
    <div>
      <h2>🏥 Hospital Edge Node: Compliance & Audit Dashboard</h2>
      <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>Secure Logout</button>
      <hr />

      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      <h3>📥 Incoming Sponsor Queries (Audit Trail)</h3>
      <p><i>Monitor the AST Parser and Differential Privacy Engine in real-time.</i></p>

      {queries.length === 0 ? (
        <p>No queries have hit this node yet.</p>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {queries.map((query) => (
            <li key={query.id} style={{ border: "2px solid black", padding: "15px", marginBottom: "20px" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>Sponsor: {query.sponsor}</strong>
                <span style={{ 
                  color: query.status.includes("Blocked") ? "red" : "green",
                  fontWeight: "bold"
                }}>
                  Status: {query.status}
                </span>
              </div>

              <br />
              
              <fieldset>
                <legend>Privacy Engine Metrics</legend>
                <p>True Patient Count: <strong>{query.true_count}</strong></p>
                <p>Fuzzed Count Sent to Sponsor: <strong>{query.fuzzed_count}</strong></p>
                {query.true_count < 5 && (
                  <p style={{ color: "red" }}>🚨 <i>K-Anonymity Shield Activated! True count dropped to 0.</i></p>
                )}
              </fieldset>

              <br />

              <details>
                <summary style={{ cursor: "pointer", fontWeight: "bold" }}>Inspect AST Generated SQL & Proof</summary>
                <div style={{ background: "#eee", padding: "10px", marginTop: "10px" }}>
                  <p><strong>Executed SQL:</strong></p>
                  <code>{query.sql_query}</code>
                  <br /><br />
                  <p><strong>ZKP Execution Proof Hash:</strong></p>
                  <code>{query.execution_proof}</code>
                </div>
              </details>

              <br />

              {query.needs_approval && (
                <div style={{ borderTop: "1px dashed black", paddingTop: "10px" }}>
                  <p><strong>Pending Action:</strong> Sponsor is requesting to proceed to Trial phase.</p>
                  <button onClick={() => handleApprove(query.id)}>Approve Data Use Agreement (DUA)</button>
                </div>
              )}

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
