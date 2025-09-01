# Frontend React - Crossword Challenge

Features implemented:
- User authentication (login/logout) with token persistence
- Display of current crossword with editable grid
- Timer per puzzle session
- Answer submission to backend
- Leaderboard viewing
- Admin-only crossword management (list, create, activate, toggle active)
- Light/modern theme with configurable brand colors

Configuration:
- Copy `.env.example` to `.env` and set REACT_APP_API_BASE to your backend API base (e.g., http://localhost:8000/api).
- Optionally set REACT_APP_LEADERBOARD_PAGE_SIZE.

Routing:
- `/` Play current crossword
- `/leaderboard` Leaderboard
- `/admin` Admin panel (requires admin user)
- `/login` Login

API Contract:
- This frontend expects REST endpoints:
  - POST /auth/login/
  - POST /auth/logout/
  - GET /auth/me/
  - GET /crosswords/current/
  - POST /crosswords/{id}/submit/
  - GET /leaderboard/
  - Admin:
    - GET /admin/crosswords/
    - POST /admin/crosswords/
    - PUT /admin/crosswords/{id}/
    - POST /admin/crosswords/{id}/activate/

Update the API layer in `src/api/index.js` if backend routes differ.
