import React, { useEffect, useMemo, useState } from "react";
import { api } from "../modules/api/client";
import { useAuth } from "../modules/auth/AuthContext";
import { useTimer, formatMs } from "../modules/timer/useTimer";
import CrosswordGrid from "../components/CrosswordGrid";
import LeaderboardSidebar from "../components/LeaderboardSidebar";

// PUBLIC_INTERFACE
export default function CrosswordPage() {
  /**
   * Page to display current crosswords, start a session with timer,
   * input answers, and submit to backend.
   */
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [active, setActive] = useState(null);
  const [grid, setGrid] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timer = useTimer(false);

  useEffect(() => {
    let canceled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await api.getCurrentCrosswords(token);
        if (!canceled) setList(Array.isArray(data) ? data : []);
      } catch {
        if (!canceled) setList([]);
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    load();
    return () => { canceled = true; };
  }, [token]);

  const selectCrossword = async (cw) => {
    setActive(cw);
    setValues({});
    timer.reset();
    timer.start();
    try {
      const full = await api.getCrossword(cw.id, token);
      const g = normalizeGrid(full?.grid || full?.puzzle || cw?.grid || []);
      setGrid(g);
    } catch {
      setGrid([]);
    }
  };

  const normalizeGrid = (g) => {
    // Ensure array of arrays with characters or '#'
    if (!Array.isArray(g)) return [];
    return g.map(row => {
      if (typeof row === "string") return row.split("");
      if (Array.isArray(row)) return row;
      return [];
    });
  };

  const onCellChange = (key, v) => {
    setValues(prev => ({ ...prev, [key]: v }));
  };

  const payload = useMemo(() => ({
    elapsed_ms: Math.round(timer.elapsedMs),
    answers: values
  }), [timer.elapsedMs, values]);

  const submit = async () => {
    if (!active) return;
    setSubmitting(true);
    try {
      await api.submitAnswers(active.id, payload, token);
      timer.pause();
      alert("Answers submitted! Check leaderboard for results.");
    } catch (e) {
      alert(`Submission failed: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="card" style={{ overflow: "hidden" }}>
        <div className="card-header">
          <div className="card-title">Current Crosswords</div>
          <div className="meta">
            <span>Timer</span>
            <strong>{formatMs(timer.elapsedMs)}</strong>
            {timer.running ? (
              <button className="btn" onClick={timer.pause}>Pause</button>
            ) : (
              <button className="btn" onClick={timer.start}>Start</button>
            )}
            <button className="btn" onClick={timer.reset}>Reset</button>
          </div>
        </div>
        <div className="card-body" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
          <div>
            {loading ? <div className="helper">Loading...</div> : (
              <div>
                {list.map(cw => (
                  <div key={cw.id} className="card" style={{ marginBottom: 8 }}>
                    <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div><strong>{cw.title || `Crossword #${cw.id}`}</strong></div>
                        <div className="meta">
                          <span>{cw.size ? `${cw.size}x${cw.size}` : ""}</span>
                          {cw.due_at && (<><span>•</span><span>Due {new Date(cw.due_at).toLocaleString()}</span></>)}
                        </div>
                      </div>
                      <button className="btn btn-accent" onClick={() => selectCrossword(cw)}>Open</button>
                    </div>
                  </div>
                ))}
                {list.length === 0 && <div className="helper">No available crosswords.</div>}
              </div>
            )}
          </div>
          <div>
            {grid?.length ? (
              <>
                <CrosswordGrid grid={grid} values={values} onChange={onCellChange} />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12, gap: 8 }}>
                  <button className="btn" onClick={submit} disabled={submitting}>{submitting ? "Submitting..." : "Submit Answers"}</button>
                </div>
              </>
            ) : (
              <div className="helper">Select a crossword to begin.</div>
            )}
          </div>
        </div>
      </section>
      <div>
        <LeaderboardSidebar />
      </div>
    </>
  );
}
