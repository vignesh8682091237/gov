# Consent-Based Link Analytics and Device Information Collection System

A full-stack, consent-first web analytics project. An admin generates a
unique tracking link; a visitor who opens it always sees an explicit consent
page first; only after clicking **Allow & Continue** does the system record
standard, non-invasive technical information (the same class of data any
website already receives). Declining is fully respected and only the bare
minimum audit event is stored.

> **Privacy guarantee, by design:** this system never requests or stores
> passwords, OTPs, contacts, saved emails/phone numbers, browser
> credentials, cookies belonging to other sites, session tokens, files,
> camera/microphone data, or precise GPS location. See
> `backend/models/visitor_session.py` and `backend/routes/tracking.py` for
> the enforcement points.

## Tech stack

- **Frontend:** React 18 + Vite, Tailwind CSS, Recharts, Axios, React Router
- **Backend:** Python 3.12, Flask, Flask-SQLAlchemy, Flask-Limiter, Flask-Talisman
- **Database:** PostgreSQL
- **Auth:** Argon2id password hashing + stateless JWT sessions
- **Deployment:** Docker + docker-compose, Gunicorn, nginx

## Project structure

```
consent-link-analytics/
├── backend/          Flask app (models, routes, middleware, services, utils)
├── database/          schema.sql (mirrors the SQLAlchemy models)
├── frontend/          React + Vite admin dashboard + visitor consent flow
├── docker/             Dockerfiles for backend and frontend
├── tests/              pytest suite (auth, consent flow, validation/security)
├── docker-compose.yml
├── .env.example
└── README.md
```

## 1. Local setup (without Docker)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ running locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp ../.env.example ../.env      # then edit ../.env with real values
export $(grep -v '^#' ../.env | xargs)   # or use python-dotenv / direnv

# Create the database in Postgres first, e.g.:
#   createdb consent_analytics

flask --app app init-db          # creates tables
flask --app app create-admin     # interactive: creates your first admin login

flask --app app run --debug --port 5000
```

Backend now runs at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:5000" > .env
npm run dev
```

Frontend now runs at `http://localhost:5173`.

- Admin login: `http://localhost:5173/login`
- A generated tracking link looks like: `http://localhost:5173/t/ABCD1234`

### Running tests

```bash
cd backend
pip install -r requirements.txt   # includes pytest
cd ..
pytest tests/
```

Tests use an in-memory SQLite database (via `TestingConfig`) so no Postgres
instance is required to run them.

## 2. Local setup with Docker

```bash
cp .env.example .env       # edit values: SECRET_KEY, JWT_SECRET_KEY, POSTGRES_PASSWORD
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000`
- Postgres: `localhost:5432`

Create the first admin user inside the running backend container:

```bash
docker compose exec backend flask --app app create-admin
```

## 3. Deployment notes

- Set `FLASK_ENV=production` and `FORCE_HTTPS=true`; Flask-Talisman will
  then enforce HTTPS and a baseline Content-Security-Policy.
- Put the stack behind a reverse proxy (nginx/Caddy/Cloud load balancer)
  that terminates TLS and forwards `X-Forwarded-For` correctly — the
  backend's `get_client_ip()` helper trusts the first hop of that header.
- Generate long, random values for `SECRET_KEY` and `JWT_SECRET_KEY`
  (e.g. `python -c "import secrets; print(secrets.token_hex(32))"`), and
  inject them as real environment variables/secrets — never commit `.env`.
- Schedule `flask --app app purge-expired-data` (e.g. a daily cron job or
  Kubernetes CronJob) to enforce `DATA_RETENTION_DAYS`.
- Consider adding a token-blocklist store (Redis) if you need immediate
  server-side JWT revocation on logout, beyond the default token-expiry
  based model used here.
- Point `RATELIMIT_STORAGE_URI` at Redis in multi-instance deployments
  (the in-memory limiter only works per-process).

## 4. API summary

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | — | Admin login, returns JWT |
| POST | `/api/admin/logout` | JWT | Audited logout |
| GET  | `/api/admin/me` | JWT | Current admin profile |
| POST | `/api/links` | JWT | Create tracking campaign |
| GET  | `/api/links` | JWT | List tracking links + stats |
| GET/PATCH/DELETE | `/api/links/:id` | JWT | Manage a link |
| GET  | `/api/links/:id/statistics` | JWT | Per-link breakdowns |
| GET  | `/api/tracking/:code` | — | Resolve link + consent notice text |
| POST | `/api/tracking/:code/consent` | — | Record accept/decline |
| POST | `/api/tracking/:code/details` | — | Submit optional form (post-consent only) |
| GET  | `/api/dashboard/statistics` | JWT | Aggregate dashboard data |
| GET  | `/api/visitors` | JWT | Paginated visitor table |
| GET  | `/api/visitors/:session_id/details` | JWT | Optional voluntary details |
| GET  | `/api/audit` | JWT | Audit log |

## 5. Security checklist implemented

- Argon2id password hashing (auto-rehash on parameter upgrade)
- Stateless JWT auth with expiry; all admin routes behind `@admin_required`
- Flask-Limiter rate limiting (login especially)
- Input sanitization (`bleach`) against stored XSS
- SQLAlchemy parameterized queries (no raw SQL string interpolation)
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, restrictive `Permissions-Policy`) + optional
  Flask-Talisman HSTS/CSP in production
- CORS locked to configured origins only
- No secrets hardcoded — app refuses to boot without `SECRET_KEY`/`JWT_SECRET_KEY`
- Append-only audit log for login attempts, link changes, logout
- IP masking in dashboard views (configurable) + configurable data retention/purge job

## 6. Why this design counts as "ethical"

Every technical-info field this system can store maps to something a
browser already discloses to any website it visits (User-Agent, screen
size, language, timezone, referrer) or to the bare fact of an HTTP request
(IP, timestamp). The one addition beyond a typical analytics tool is that
this project makes the disclosure **explicit and opt-in via a consent
gate**, and it hard-blocks anything that would require special/covert
permissions (contacts, precise GPS, camera, mic, stored credentials). That
combination — transparency plus a technical ceiling on what can ever be
collected — is what distinguishes this from tracking/spyware tooling, and
it's the property to preserve if you extend this project further.
