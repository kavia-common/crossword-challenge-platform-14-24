import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

// PUBLIC_INTERFACE
export default function LoginForm() {
  /**
   * Simple username/password login form.
   */
  const { login, error } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    const ok = await login(form.username, form.password);
    if (!ok) {
      setMessage('Invalid credentials');
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360, margin: '40px auto', padding: 20, border: '1px solid #e9ecef', borderRadius: 8 }}>
      <h2 style={{ marginTop: 0 }}>Login</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label>
          Username
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            type="text"
            placeholder="Enter username"
            required
            style={{ width: '100%', padding: 10, marginTop: 4 }}
          />
        </label>
        <label>
          Password
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="Enter password"
            required
            style={{ width: '100%', padding: 10, marginTop: 4 }}
          />
        </label>
        <button type="submit" disabled={submitting} className="theme-toggle" style={{ position: 'static' }}>
          {submitting ? 'Signing in...' : 'Login'}
        </button>
        {message || error ? (
          <div role="alert" style={{ color: '#b00020' }}>{message || error}</div>
        ) : null}
      </div>
    </form>
  );
}
