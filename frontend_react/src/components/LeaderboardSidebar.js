import React, { useEffect, useState } from "react";
import { api } from "../modules/api/client";

// PUBLIC_INTERFACE
export default function LeaderboardSidebar() {
  /** Sidebar showing top performers. */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const data = await api.getLeaderboard();
        if (!canceled) setItems(Array.isArray(data) ? data.slice(0, 10) : []);
      } catch (_) {
        if (!canceled) setItems([]);
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    load();
    return () => { canceled = true; };
  }, []);

  return (
    <aside className="card">
      <div className="card-header">
        <div className="card-title">Leaderboard</div>
      </div>
      <div className="card-body">
        {loading ? <div className="helper">Loading...</div> : (
          <ul className="leaderboard-list">
            {items.map((it, idx) => (
              <li key={idx} className="leaderboard-item">
                <div>
                  <strong>{it.username || it.user || `User ${idx+1}`}</strong>
                  <div className="meta">
                    <span>{it.accuracy != null ? `${Math.round(it.accuracy)}%` : "-"}</span>
                    <span>•</span>
                    <span>{it.time || it.duration || "-"}</span>
                  </div>
                </div>
                <div>#{idx + 1}</div>
              </li>
            ))}
            {items.length === 0 && <div className="helper">No scores yet.</div>}
          </ul>
        )}
      </div>
    </aside>
  );
}
