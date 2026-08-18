# RepoVibe — separated frontend/backend

This package keeps the existing RepoVibe UI in `frontend/` and the existing
TanStack Start/API/database/analysis application in `backend/`.

## What was changed

- `backend/` is preserved as the real API, GitHub analysis engine, Supabase integration, auth, migrations, and server application.
- `frontend/` keeps the existing UI/components and now talks to the backend through `VITE_API_BASE`.
- The frontend no longer contains the old `seededRand()` fake-analysis generator or client-side analysis persistence path.
- No backend secret/API key/database values were copied into the frontend.

## Local development

Backend:

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:3000`.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and uses `VITE_API_BASE=http://localhost:3000`.

## Production

Deploy `backend/` with its existing server environment variables:

- `GITHUB_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `CORS_ORIGIN`

Deploy `frontend/` separately and set:

- `VITE_API_BASE=https://YOUR-BACKEND-DOMAIN`

Set the backend's `CORS_ORIGIN` to the exact frontend production origin.

Do not commit real `.env` files or service-role/GitHub secrets.
