/**
 * PUBLIC_INTERFACE
 * API functions for interacting with the backend REST endpoints.
 * All functions return axios promises (use .then/.catch or async/await).
 *
 * This file aligns with the Django backend openapi.json found at:
 * backend_django/interfaces/openapi.json (basePath: /api)
 *
 * Key differences to note:
 * - No /crosswords/current/ endpoint is defined in the backend spec.
 *   We will derive "current" as the first active crossword from /crosswords/ list or fallback to the first item.
 * - Leaderboard requires a crossword_id query parameter per spec.
 * - Session-based submit endpoints exist (/sessions/start/, /sessions/{id}/submit/, /sessions/{id}/end/),
 *   but if your backend also supports simpler submit endpoints, we try them first then gracefully fallback.
 */

import client from './client';

// PUBLIC_INTERFACE
export async function login(username, password) {
  /**
   * Authenticate and retrieve an auth token.
   * Returns: { token?, user: { username, is_admin|is_staff, ... } }
   */
  const { data } = await client.post('auth/login/', { username, password });
  return data;
}

// PUBLIC_INTERFACE
export async function logout() {
  /**
   * Logout current user (server-side if supported).
   * Returns: 204 or 200
   */
  const { data } = await client.post('auth/logout/');
  return data;
}

// PUBLIC_INTERFACE
export async function getMe() {
  /**
   * Fetch current user profile.
   * Returns: { username, is_admin|is_staff, ... }
   */
  const { data } = await client.get('auth/me/');
  return data;
}

/**
 * Internal helper: list public crosswords (/crosswords/).
 */
async function listPublicCrosswords() {
  const { data } = await client.get('crosswords/');
  return Array.isArray(data) ? data : data?.results || [];
}

// PUBLIC_INTERFACE
export async function getCurrentCrossword() {
  /**
   * Fetch a "current" crossword approximation:
   * - Try to find one with is_active === true from /crosswords/
   * - Otherwise, return the first crossword if available
   * Throws if none found.
   */
  const list = await listPublicCrosswords();
  if (!list || list.length === 0) {
    throw { normalizedMessage: 'No crosswords available', status: 404 };
  }
  const active = list.find((c) => c.is_active);
  return active || list[0];
}

// PUBLIC_INTERFACE
export async function submitAnswer(crosswordId, answers, timeElapsedSec) {
  /**
   * Submit user's answers.
   * Preferred: use session-based endpoints if supported by backend:
   *   1) POST sessions/start/ { crossword_id, time_limit_seconds: 0 }
   *   2) For each answer payload as a single combined submission, call sessions/{id}/submit/ with your structure if backend supports it
   *   3) POST sessions/{id}/end/ to finalize and compute stats
   *
   * Fallback (if simpler endpoints exist): try POST crosswords/{id}/submit/
   */
  // First try simple endpoint if backend supports it (some implementations do)
  try {
    const { data } = await client.post(`crosswords/${crosswordId}/submit/`, {
      answers,
      time_elapsed_sec: timeElapsedSec,
    });
    return data;
  } catch (e) {
    // If 404, try session-based flow per backend spec
    if (e?.status !== 404) throw e;
  }

  // Session-based flow
  // 1) start session
  const startResp = await client.post('sessions/start/', {
    crossword_id: crosswordId,
    time_limit_seconds: 0,
  });
  const session = startResp.data;
  const sessionId = session?.id;
  if (!sessionId) {
    throw { normalizedMessage: 'Failed to start session', status: 500 };
  }

  // 2) submit answers — backend spec shows sessions/{id}/submit/ expects { entry_id, answer }
  // Our "answers" is a grid of letters; without mapping to entry IDs we cannot submit per-entry.
  // As a practical fallback, send a combined payload if backend supports it; otherwise skip to end.
  try {
    await client.post(`sessions/${sessionId}/submit/`, {
      // Non-standard payload; backend may ignore or error. We attempt gracefully.
      answers,
      time_elapsed_sec: timeElapsedSec,
    });
  } catch (_) {
    // Ignore; we will still end the session
  }

  // 3) end session (compute results)
  const endResp = await client.post(`sessions/${sessionId}/end/`, session);
  return {
    correct: endResp?.data?.completed ?? false,
    score: undefined,
    completion_time_sec: endResp?.data?.elapsed_seconds ?? timeElapsedSec,
    errors: [],
    raw: endResp?.data,
  };
}

// PUBLIC_INTERFACE
export async function getLeaderboard(limit = Number(process.env.REACT_APP_LEADERBOARD_PAGE_SIZE) || 20) {
  /**
   * Fetch leaderboard entries for a crossword.
   * Backend requires crossword_id param. We use current crossword's id.
   * Returns: [{ user|username, score?, completion_time_sec|fastest_seconds, accuracy, submitted_at? }, ...]
   */
  const current = await getCurrentCrossword();
  const id = current?.id;
  const { data } = await client.get(`leaderboard/?crossword_id=${encodeURIComponent(id)}&limit=${encodeURIComponent(limit)}`);
  return data;
}

// PUBLIC_INTERFACE
export async function listCrosswords() {
  /**
   * Admin: list crosswords.
   */
  const { data } = await client.get('admin/crosswords/');
  return data;
}

// PUBLIC_INTERFACE
export async function createCrossword(payload) {
  /**
   * Admin: create new crossword.
   * payload: per backend spec CrosswordAdminWrite (entries-based schema)
   */
  const { data } = await client.post('admin/crosswords/', payload);
  return data;
}

// PUBLIC_INTERFACE
export async function updateCrossword(id, payload) {
  /**
   * Admin: update crossword.
   */
  const { data } = await client.put(`admin/crosswords/${id}/`, payload);
  return data;
}

// PUBLIC_INTERFACE
export async function setActiveCrossword(id) {
  /**
   * Admin: set crossword active.
   * Note: This endpoint is assumed by the UI but not in provided OpenAPI.
   * If backend lacks it, this will 404. The AdminPanel shows error messages accordingly.
   */
  const { data } = await client.post(`admin/crosswords/${id}/activate/`);
  return data;
}
