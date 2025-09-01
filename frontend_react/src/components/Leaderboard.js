import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../api';

// PUBLIC_INTERFACE
export default function Leaderboard() {
  /**
   * Displays leaderboard entries.
   */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;
    getLeaderboard()
      .then((data) => {
        if (!mounted) return;
        setRows(Array.isArray(data) ? data : data?.results || []);
      })
      .catch((e) => setErr(e.normalizedMessage || 'Failed to load leaderboard'))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading leaderboard...</div>;
  if (err) return <div role="alert" style={{ color: '#b00020' }}>{err}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Leaderboard</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>#</th>
              <th style={th}>User</th>
              <th style={th}>Score</th>
              <th style={th}>Accuracy</th>
              <th style={th}>Time (s)</th>
              <th style={th}>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} style={{ borderTop: '1px solid #eee' }}>
                <td style={td}>{idx + 1}</td>
                <td style={td}>{r.username || r.user || '-'}</td>
                <td style={td}>{r.score ?? '-'}</td>
                <td style={td}>{typeof r.accuracy === 'number' ? `${(r.accuracy * 100).toFixed(1)}%` : '-'}</td>
                <td style={td}>{r.completion_time_sec ?? r.time_sec ?? '-'}</td>
                <td style={td}>{r.submitted_at ? new Date(r.submitted_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 16, textAlign: 'center' }}>No entries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = { textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' };
const td = { padding: 8, verticalAlign: 'top' };
