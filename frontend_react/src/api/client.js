import axios from 'axios';

/**
 * Axios client configured to communicate with the Django backend.
 * Uses token-based auth if available in localStorage.
 * All endpoints are prefixed by REACT_APP_API_BASE.
 *
 * Note:
 * - Ensure REACT_APP_API_BASE includes the /api basePath and trailing slash for consistent URL joins.
 *   Example: http://localhost:8000/api/
 */

const rawBase = process.env.REACT_APP_API_BASE || '/api/';
const API_BASE = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    // Assuming backend expects Bearer token
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Basic error normalization
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Prefer backend-provided message fields commonly used by DRF
    const detail = error?.response?.data?.detail
      || error?.response?.data?.message
      || error?.response?.data?.error;
    const message = detail || error.message || 'Request error';
    return Promise.reject({ ...error, normalizedMessage: message, status: error?.response?.status });
  }
);

export default client;
