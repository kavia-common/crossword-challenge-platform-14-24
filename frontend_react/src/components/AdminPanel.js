import React, { useEffect, useState } from 'react';
import { createCrossword, listCrosswords, setActiveCrossword, updateCrossword } from '../api';
import { useAuth } from '../hooks/useAuth';

// PUBLIC_INTERFACE
export default function AdminPanel() {
  /**
   * Admin-only crossword management.
   */
  const { isAdmin } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({
    title: '',
    time_limit_seconds: 600,
    grid: '[["", "", ""], ["", "#", ""], ["", "", ""]]',
    clues: '{"across": [], "down": []}'
  });

  const fetchList = () => {
    setLoading(true);
    listCrosswords()
      .then((data) => setList(Array.isArray(data) ? data : data?.results || []))
      .catch((e) => setErr(e.normalizedMessage || 'Failed to load crosswords'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isAdmin) fetchList();
  }, [isAdmin]);

  if (!isAdmin) return <div>You are not authorized to view this page.</div>;
  if (loading) return <div>Loading crosswords...</div>;
  if (err) return <div role="alert" style={{ color: '#b00020' }}>{err}</div>;

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        time_limit_seconds: Number(form.time_limit_seconds),
        grid: JSON.parse(form.grid),
        clues: JSON.parse(form.clues),
        is_active: false
      };
      await createCrossword(payload);
      setForm((f) => ({ ...f, title: '' }));
      fetchList();
    } catch (e2) {
      alert(e2.normalizedMessage || 'Failed to create crossword. Check JSON formats.');
    }
  };

  const handleActivate = async (id) => {
    try {
      await setActiveCrossword(id);
      fetchList();
    } catch (e) {
      alert(e.normalizedMessage || 'Failed to activate crossword');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await updateCrossword(item.id, { is_active: !item.is_active });
      fetchList();
    } catch (e) {
      alert(e.normalizedMessage || 'Failed to update crossword');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin Panel</h2>
      <section style={{ marginBottom: 24 }}>
        <h3>Create Crossword</h3>
        <form onSubmit={handleCreate} style={{ display: 'grid', gap: 8, maxWidth: 720 }}>
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            style={input}
          />
          <input
            placeholder="Time limit seconds"
            type="number"
            value={form.time_limit_seconds}
            onChange={(e) => setForm((f) => ({ ...f, time_limit_seconds: e.target.value }))}
            required
            style={input}
          />
          <textarea
            placeholder='Grid JSON e.g. [["", "", ""], ["", "#", ""], ["", "", ""]]'
            value={form.grid}
            onChange={(e) => setForm((f) => ({ ...f, grid: e.target.value }))}
            rows={6}
            style={textarea}
          />
          <textarea
            placeholder='Clues JSON e.g. {"across":[{"number":1,"text":"..."},{"number":2,"text":"..."}],"down":[...] }'
            value={form.clues}
            onChange={(e) => setForm((f) => ({ ...f, clues: e.target.value }))}
            rows={6}
            style={textarea}
          />
          <button type="submit" className="theme-toggle" style={{ position: 'static', width: 160 }}>Create</button>
        </form>
      </section>

      <section>
        <h3>Existing Crosswords</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>ID</th>
                <th style={th}>Title</th>
                <th style={th}>Active</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={td}>{item.id}</td>
                  <td style={td}>{item.title}</td>
                  <td style={td}>{item.is_active ? 'Yes' : 'No'}</td>
                  <td style={td}>
                    <button className="theme-toggle" style={{ position: 'static', marginRight: 8 }} onClick={() => handleActivate(item.id)}>Set Active</button>
                    <button className="theme-toggle" style={{ position: 'static' }} onClick={() => handleToggleActive(item)}>{item.is_active ? 'Deactivate' : 'Activate'}</button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={4} style={{ padding: 16, textAlign: 'center' }}>No crosswords found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const th = { textAlign: 'left', padding: 8, borderBottom: '1px solid #ddd' };
const td = { padding: 8, verticalAlign: 'top' };
const input = { padding: 10, borderRadius: 6, border: '1px solid #ddd' };
const textarea = { padding: 10, borderRadius: 6, border: '1px solid #ddd', fontFamily: 'monospace' };
