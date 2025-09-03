import React, { useEffect, useState } from "react";
import { api } from "../modules/api/client";

// PUBLIC_INTERFACE
export default function LeaderboardPage() {
  /** Full leaderboard page with extended list. */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const data = await api.getLeaderboard();
        if (!canceled) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (!canceled) setItems([]);
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    load();
    return () => { canceled = true; };
  }, []);

  return (
    <section className="card" style={{ gridColumn: "1 / -1" }}>
      <div className="card-header">
        <div className="card-title">Leaderboard</div>
      </div>
      <div className="card-body">
        {loading ? <div className="helper">Loading...</div> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #e2e8f0" }}>#</th>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #e2e8f0" }}>User</th>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #e2e8f0" }}>Time</th>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #e2e8f0" }}>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>{idx + 1}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}><strong>{it.username || it.user || `User ${idx+1}`}</strong></td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>{it.time || it.duration || "-"}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>{it.accuracy != null ? `${Math.round(it.accuracy)}%` : "-"}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} style={{ padding: 16, textAlign: "center" }} className="helper">No entries yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
