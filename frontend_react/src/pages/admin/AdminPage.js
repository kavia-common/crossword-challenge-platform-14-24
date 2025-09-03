import React, { useEffect, useState } from "react";
import { api } from "../../modules/api/client";
import { useAuth } from "../../modules/auth/AuthContext";

// PUBLIC_INTERFACE
export default function AdminPage() {
  /** Admin management for crosswords: list, create, update, delete. */
  const { token } = useAuth();
  const [tab, setTab] = useState("list");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    grid: "",
    size: 0,
    due_at: ""
  });

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await api.adminList(token);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []); // eslint-disable-line

  const onCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        size: Number(form.size) || undefined,
        due_at: form.due_at || undefined,
        grid: tryParseGrid(form.grid),
      };
      await api.adminCreate(payload, token);
      setForm({ title: "", grid: "", size: 0, due_at: "" });
      setTab("list");
      await refresh();
      alert("Crossword created.");
    } catch (e) {
      alert(`Create failed: ${e.message}`);
    }
  };

  const tryParseGrid = (txt) => {
    try {
      const parsed = JSON.parse(txt);
      return parsed;
    } catch {
      // allow simple newline string rows
      const rows = txt.split("\n").map(r => r.trim()).filter(Boolean);
      return rows;
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this crossword?")) return;
    try {
      await api.adminDelete(id, token);
      await refresh();
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    }
  };

  return (
    <section className="card" style={{ gridColumn: "1 / -1" }}>
      <div className="card-header">
        <div className="card-title">Admin - Crosswords</div>
        <div className="tabs">
          <button className={`tab ${tab === "list" ? "active" : ""}`} onClick={() => setTab("list")}>List</button>
          <button className={`tab ${tab === "create" ? "active" : ""}`} onClick={() => setTab("create")}>Create</button>
        </div>
      </div>
      <div className="card-body">
        {tab === "list" && (
          <div>
            {loading ? <div className="helper">Loading...</div> : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #e2e8f0" }}>ID</th>
                    <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #e2e8f0" }}>Title</th>
                    <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #e2e8f0" }}>Size</th>
                    <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #e2e8f0" }}>Due</th>
                    <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #e2e8f0" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>{it.id}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>{it.title}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>{it.size}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>{it.due_at ? new Date(it.due_at).toLocaleString() : "-"}</td>
                      <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>
                        <button className="btn" onClick={() => onDelete(it.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 16 }} className="helper">No crosswords found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
        {tab === "create" && (
          <form onSubmit={onCreate} style={{ maxWidth: 720 }}>
            <label className="field">
              <span>Title</span>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label className="field">
              <span>Size</span>
              <input className="input" type="number" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
              <span className="helper">Optional. Informational only if grid is provided as rows.</span>
            </label>
            <label className="field">
              <span>Due At</span>
              <input className="input" type="datetime-local" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} />
            </label>
            <label className="field">
              <span>Grid</span>
              <textarea className="input" rows={8} value={form.grid} onChange={(e) => setForm({ ...form, grid: e.target.value })} placeholder='Either JSON (e.g., ["#####","##A##"]) or newline-separated rows. Use "#" for blocks.' />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-accent" type="submit">Create</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
