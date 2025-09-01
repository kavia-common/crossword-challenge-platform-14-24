/**
 * PUBLIC_INTERFACE
 * API functions for interacting with the backend REST endpoints.
 * All functions return axios promises (use .then/.catch or async/await).
 */

import client from './client';

// PUBLIC_INTERFACE
export async function login(username, password) {
  /**
   * Authenticate and retrieve an auth token.
   * Returns: { token, user: { username, is_admin, ... } }
   */
  const { data } = await client.post('/auth/login/', { username, password });
  return data;
}

// PUBLIC_INTERFACE
export async function logout() {
  /**
   * Logout current user (server-side if supported).
   * Returns: 204 or 200
   */
  const { data } = await client.post('/auth/logout/');
  return data;
}

// PUBLIC_INTERFACE
export async function getMe() {
  /**
   * Fetch current user profile.
   * Returns: { username, is_admin, ... }
   */
  const { data } = await client.get('/auth/me/');
  return data;
}

// PUBLIC_INTERFACE
export async function getCurrentCrossword() {
  /**
   * Fetch the current active crossword and related metadata.
   * Returns: { id, title, grid: string[][], clues: { across: [], down: [] }, time_limit_seconds, started_at(optional) }
   */
  const { data } = await client.get('/crosswords/current/');
  return data;
}

// PUBLIC_INTERFACE
export async function submitAnswer(crosswordId, answers, timeElapsedSec) {
  /**
   * Submit user's answers.
   * Params:
   *  - crosswordId: number/string
   *  - answers: [{ row, col, letter }]
   *  - timeElapsedSec: number
   * Returns: { correct: boolean, score, errors: [], completion_time_sec, leaderboard_entry }
   */
  const { data } = await client.post(`/crosswords/${crosswordId}/submit/`, {
    answers,
    time_elapsed_sec: timeElapsedSec,
  });
  return data;
}

// PUBLIC_INTERFACE
export async function getLeaderboard(limit = Number(process.env.REACT_APP_LEADERBOARD_PAGE_SIZE) || 20) {
  /**
   * Fetch leaderboard entries for current crossword or overall.
   * Returns: [{ username, score, completion_time_sec, accuracy, submitted_at }, ...]
   */
  const { data } = await client.get(`/leaderboard/?limit=${limit}`);
  return data;
}

// PUBLIC_INTERFACE
export async function listCrosswords() {
  /**
   * Admin: list crosswords.
   */
  const { data } = await client.get('/admin/crosswords/');
  return data;
}

// PUBLIC_INTERFACE
export async function createCrossword(payload) {
  /**
   * Admin: create new crossword.
   * payload: { title, grid, clues, time_limit_seconds, is_active }
   */
  const { data } = await client.post('/admin/crosswords/', payload);
  return data;
}

// PUBLIC_INTERFACE
export async function updateCrossword(id, payload) {
  /**
   * Admin: update crossword.
   */
  const { data } = await client.put(`/admin/crosswords/${id}/`, payload);
  return data;
}

// PUBLIC_INTERFACE
export async function setActiveCrossword(id) {
  /**
   * Admin: set crossword active.
   */
  const { data } = await client.post(`/admin/crosswords/${id}/activate/`);
  return data;
}
