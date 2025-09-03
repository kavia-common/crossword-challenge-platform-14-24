//
// Lightweight API client for Django REST endpoints.
// Uses environment variable REACT_APP_API_BASE_URL.
//
// PUBLIC_INTERFACE
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

async function request(path, { method = "GET", body, token, headers = {} } = {}) {
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };
  if (token) {
    opts.headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, opts);
  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`;
    try {
      if (contentType.includes("application/json")) {
        const err = await res.json();
        detail = err.detail || JSON.stringify(err);
      } else {
        detail = await res.text();
      }
    } catch (_) {
      /* ignore parse errors */
    }
    throw new Error(detail);
  }

  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

// PUBLIC_INTERFACE
export const api = {
  // Auth
  login: (username, password) => request("/auth/login/", { method: "POST", body: { username, password } }),
  me: (token) => request("/auth/me/", { token }),
  logout: (token) => request("/auth/logout/", { method: "POST", token }),

  // Crosswords
  getCurrentCrosswords: (token) => request("/crosswords/current/", { token }),
  getCrossword: (id, token) => request(`/crosswords/${id}/`, { token }),
  submitAnswers: (id, payload, token) => request(`/crosswords/${id}/submit/`, { method: "POST", body: payload, token }),

  // Leaderboard
  getLeaderboard: () => request("/leaderboard/", {}),

  // Admin
  adminList: (token) => request("/admin/crosswords/", { token }),
  adminCreate: (payload, token) => request("/admin/crosswords/", { method: "POST", body: payload, token }),
  adminUpdate: (id, payload, token) => request(`/admin/crosswords/${id}/`, { method: "PUT", body: payload, token }),
  adminDelete: (id, token) => request(`/admin/crosswords/${id}/`, { method: "DELETE", token }),
};
