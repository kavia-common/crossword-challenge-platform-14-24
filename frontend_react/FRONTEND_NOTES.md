# Frontend React - Crossword Challenge

Features implemented:
- User authentication (login/logout) with token persistence
- Display of current crossword with editable grid
- Timer per puzzle session
- Answer submission to backend (supports simple or session-based backends)
- Leaderboard viewing
- Admin-only crossword management (list, create, activate, toggle active)
- Light/modern theme with configurable brand colors

Configuration:
- Copy `.env.example` to `.env` and set REACT_APP_API_BASE to your backend API base.
  - IMPORTANT: Include the `/api/` base path and ensure it ends with a trailing slash.
  - Example: `REACT_APP_API_BASE=http://localhost:8000/api/`
- Optionally set `REACT_APP_LEADERBOARD_PAGE_SIZE`.

Routing:
- `/` Play current crossword
- `/leaderboard` Leaderboard
- `/admin` Admin panel (requires admin user)
- `/login` Login

API Notes (aligned to backend OpenAPI):
- The backend OpenAPI provided indicates:
  - Auth: POST /auth/login/, POST /auth/logout/, GET /auth/me/
  - Crosswords: GET /crosswords/, GET /crosswords/{id}/
  - Leaderboard: GET /leaderboard/?crossword_id=<id>
  - Sessions: POST /sessions/start/, POST /sessions/{id}/submit/, POST /sessions/{id}/end/
  - Admin: GET/POST /admin/crosswords/, GET/PUT/PATCH/DELETE /admin/crosswords/{id}/
- If your backend also implements simplified endpoints like:
  - GET /crosswords/current/
  - POST /crosswords/{id}/submit/
  the frontend will try those first; otherwise it will gracefully fall back to session-based flow.

Troubleshooting 404 errors:
1) Verify the React env value is correct:
   - `REACT_APP_API_BASE` should point to your backend and include `/api/` and a trailing slash.
   - For local dev: `http://localhost:8000/api/`
2) Confirm the backend is running and accessible at that URL.
3) Open the browser devtools Network tab and inspect failing requests:
   - Check that the request URL looks like `http://localhost:8000/api/auth/me/` (not missing /api or double slashes).
4) If your backend routes differ, update `src/api/index.js` functions accordingly.

Update the API layer in `src/api/index.js` if backend routes differ.
