import axios from 'axios';

/**
 * Axios client configured to communicate with the Django backend.
 * Uses token-based auth if available in localStorage.
 * All endpoints are prefixed by REACT_APP_API_BASE.
 */

const API_BASE = process.env.REACT_APP_API_BASE || '/api';

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
    const message = error?.response?.data?.detail || error.message || 'Request error';
    return Promise.reject({ ...error, normalizedMessage: message, status: error?.response?.status });
  }
);

export default client;
