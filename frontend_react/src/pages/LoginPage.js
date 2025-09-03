import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../modules/auth/AuthContext";

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Login form that authenticates user and redirects to intended page. */
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || "/crosswords";

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card" style={{ maxWidth: 420, margin: "40px auto", width: "100%" }}>
      <div className="card-header">
        <div className="card-title">Login</div>
      </div>
      <div className="card-body">
        <form onSubmit={onSubmit}>
          <label className="field">
            <span>Username</span>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourname"
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </label>
          {error && <div className="helper" style={{ color: "#b91c1c" }}>{error}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button className="btn" type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
