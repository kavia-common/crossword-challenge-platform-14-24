import React, { useEffect, useMemo, useState } from 'react';
import { getCurrentCrossword, submitAnswer } from '../api';
import CrosswordGrid from '../components/CrosswordGrid';
import Timer from '../components/Timer';
import { useAuth } from '../hooks/useAuth';

// PUBLIC_INTERFACE
export default function PlayPage() {
  /**
   * Displays current crossword if any, with timer and answer submission.
   */
  const { user } = useAuth();
  const [crossword, setCrossword] = useState(null);
  const [grid, setGrid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    getCurrentCrossword()
      .then((data) => {
        if (!mounted) return;
        setCrossword(data);
        // Deep clone grid to enable editing
        const g = (data?.grid || []).map((row) => row.map((c) => (c === '#' || c === null) ? c : (typeof c === 'string' ? c : '')));
        setGrid(g);
      })
      .catch((e) => setErr(e.normalizedMessage || 'Failed to load crossword'))
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, []);

  const handleChange = (r, c, letter) => {
    setGrid((g) => {
      const next = g.map((row) => row.slice());
      next[r][c] = letter;
      return next;
    });
  };

  const answersPayload = useMemo(() => {
    if (!grid) return [];
    const payload = [];
    grid.forEach((row, r) => row.forEach((cell, c) => {
      if (cell && cell !== '#') {
        payload.push({ row: r, col: c, letter: cell.toUpperCase() });
      }
    }));
    return payload;
  }, [grid]);

  const handleSubmit = async () => {
    if (!user) {
      setErr('Please log in to submit your answers.');
      return;
    }
    if (!crossword) return;
    setSubmitting(true);
    setErr('');
    try {
      const data = await submitAnswer(crossword.id, answersPayload, elapsed);
      setResult(data);
    } catch (e) {
      setErr(e.normalizedMessage || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Loading current crossword...</div>;
  if (err) return <div role="alert" style={{ color: '#b00020', padding: 16 }}>{err}</div>;
  if (!crossword) return <div style={{ padding: 16 }}>No active crossword available right now.</div>;

  return (
    <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
      <div>
        <h2 style={{ marginTop: 0 }}>{crossword.title || 'Current Crossword'}</h2>
        <div style={{ marginBottom: 12 }}>
          <Timer
            start
            limitSeconds={crossword.time_limit_seconds || null}
            onExpire={() => { /* Optional: auto-submit or notify */ }}
            onTick={setElapsed}
          />
        </div>
        <CrosswordGrid grid={grid} onChange={handleChange} />
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button disabled={submitting} onClick={handleSubmit} className="theme-toggle" style={{ position: 'static' }}>
            {submitting ? 'Submitting...' : 'Submit Answers'}
          </button>
        </div>
        {result && (
          <div style={{ marginTop: 16, padding: 12, border: '1px solid #e9ecef', borderRadius: 8 }}>
            <h3 style={{ marginTop: 0 }}>Result</h3>
            <div>Correct: {String(result.correct)}</div>
            {'score' in result && <div>Score: {result.score}</div>}
            {'completion_time_sec' in result && <div>Time: {result.completion_time_sec}s</div>}
            {Array.isArray(result.errors) && result.errors.length > 0 && (
              <details style={{ marginTop: 8 }}>
                <summary>Errors</summary>
                <ul>
                  {result.errors.map((er, idx) => <li key={idx}>{typeof er === 'string' ? er : JSON.stringify(er)}</li>)}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
      <aside style={{ borderLeft: '1px solid #eee', paddingLeft: 16 }}>
        <h3>Clues</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
          <section>
            <h4>Across</h4>
            <ul>
              {(crossword?.clues?.across || []).map((c, idx) => (
                <li key={`a-${idx}`}>{c.number ? `${c.number}. ` : ''}{c.text || c.clue || JSON.stringify(c)}</li>
              ))}
              {(crossword?.clues?.across || []).length === 0 && <li>No across clues</li>}
            </ul>
          </section>
          <section>
            <h4>Down</h4>
            <ul>
              {(crossword?.clues?.down || []).map((c, idx) => (
                <li key={`d-${idx}`}>{c.number ? `${c.number}. ` : ''}{c.text || c.clue || JSON.stringify(c)}</li>
              ))}
              {(crossword?.clues?.down || []).length === 0 && <li>No down clues</li>}
            </ul>
          </section>
        </div>
      </aside>
    </div>
  );
}
