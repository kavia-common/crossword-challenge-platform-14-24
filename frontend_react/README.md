# Crossword Challenge Frontend (React)

Modern, lightweight React UI for the Crossword Challenge platform.

## Features implemented (initial)
- User authentication (login/logout) via Django REST endpoints
- Display current crosswords and open a selected puzzle
- In-session timer (start/pause/reset) per puzzle
- Answer input and submission
- Leaderboard sidebar and full page
- Admin tabs for crossword management (list/create/delete)
- Responsive light theme using the provided palette:
  - Primary: `#1a237e`, Secondary: `#64b5f6`, Accent: `#ffb300`

## Quick start
1. Copy environment file:
   - `cp .env.example .env` and adjust values.
2. Install dependencies:
   - `npm install`
3. Start app:
   - `npm start` (http://localhost:3000)

## Environment variables
- `REACT_APP_API_BASE_URL` (required): Base URL for Django API (e.g., `http://localhost:8000/api`)
- `REACT_APP_SITE_URL` (optional): Public site URL for redirects

## Backend endpoints expected
Adjust to your Django routes as needed:
- `POST /auth/login/` -> { token | access }
- `GET /auth/me/` -> user profile { username, is_admin, ... }
- `POST /auth/logout/`
- `GET /crosswords/current/` -> [{ id, title, size, due_at }]
- `GET /crosswords/{id}/` -> { id, title, grid: 2D array or string rows }
- `POST /crosswords/{id}/submit/` -> accepts { elapsed_ms, answers }
- `GET /leaderboard/` -> [{ username, time, accuracy }]
- Admin:
  - `GET /admin/crosswords/`
  - `POST /admin/crosswords/`
  - `PUT /admin/crosswords/{id}/`
  - `DELETE /admin/crosswords/{id}/`

You can modify these in `src/modules/api/client.js`.

## Code structure
- `src/modules/api/client.js`: API client wrapper
- `src/modules/auth/AuthContext.js`: Auth state and actions
- `src/modules/timer/useTimer.js`: Timer hook and formatter
- `src/components/CrosswordGrid.js`: Grid component
- `src/components/LeaderboardSidebar.js`: Sidebar leaderboard
- `src/pages/LoginPage.js`: Login view
- `src/pages/CrosswordPage.js`: Main solving view with timer and submit
- `src/pages/LeaderboardPage.js`: Full leaderboard
- `src/pages/admin/AdminPage.js`: Admin CRUD (list/create/delete)

## Styling
All styling is hand-rolled CSS in `src/App.css`, using CSS variables and modern, responsive layout.

## Notes
- This is initial scaffolding; integrate with your Django API and adjust payloads as required.
- Admin update/edit flow can be extended easily in `AdminPage.js`.
