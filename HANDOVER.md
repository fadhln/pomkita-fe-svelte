# PomKita Svelte handover

## Purpose

This repository contains the PomKita SvelteKit front end. The user interface text is in Bahasa Indonesia. The integration tests use the real backend and use no mocks.

## Requirements

- Use Node.js and npm.
- Use Docker and Docker Compose.
- Keep `/root/spbu-recon/pomkita-be` at the backend commit required by the task.
- Keep ports 3100 and 8180 free. These are the default S5 ports.

The integration stack uses the database `pomkita_s5`. It does not use the normal backend test database.

## Run the application

Install packages:

```sh
npm ci
```

Run the development server:

```sh
npm run dev -- --host 127.0.0.1 --port 4173
```

Open `http://localhost:4173`.

## Run checks and tests

Run the Svelte type check:

```sh
npm run check
```

Run Vitest:

```sh
npm test
```

Run the reliable single-worker command in a resource-limited environment:

```sh
npm test -- --run --pool=threads --maxWorkers=1
```

Build the production output:

```sh
npm run build
```

Run the normal Playwright project:

```sh
npm run test:e2e
```

## Run real-backend integration tests

The integration project is named `integration`. It has one worker and no mock server.

Run the focused S5 suite. Playwright starts the Docker Compose stack through `webServer`:

```sh
npm run test:e2e:integration
```

The same run with explicit setup and cleanup is:

```sh
sh scripts/it-setup.sh
```

Keep the stack after the test run when debugging:

```sh
IT_KEEP_COMPOSE=true sh scripts/it-setup.sh
```

Reset the dedicated database to the seed data:

```sh
sh scripts/it-reset-seed.sh
```

Stop the stack and remove only its S5 volumes:

```sh
docker compose down --volumes --remove-orphans
```

Use another port pair when 3100 or 8180 is busy:

```sh
S5_FE_PORT=3200 S5_BE_PORT=8280 npm run test:e2e:integration
```

The backend service receives these required values:

- `DATABASE_URL=postgres://pomkita:pomkita@postgres:5432/pomkita_s5?sslmode=disable`
- `JWT_SECRET_KEY_1=pomkita-demo-only-secret`
- `CORS_ALLOWED_ORIGINS=http://localhost:3100`

The frontend browser uses `http://localhost:8180/api/v1`. Frontend server-side loads use `http://be:8080/api/v1`.

The seed creates one organisation, one station, three users, station roles, `jwt_keys`, catalog data, policy data, and one pending amendment. The test password for all demo users is `demo-password`.

## Contract source

Use `/root/spbu-recon/pomkita-be/docs/openapi.json` as the API contract. The API prefix is `/api/v1`.

Important S5 endpoints are:

- `POST /login` and `GET /session` for session state.
- `POST /shifts`, `GET /shifts`, and `GET /shifts/{id}` for shifts.
- `POST /drafts/claim`, `POST /drafts/readings`, and `POST /drafts/sales` for draft data.
- `POST /submissions` for report submission.
- `GET /amendments` and `POST /amendments/{id}/reject` for the governance queue.
- `GET /reports/{id}` for report detail.
- `GET /audit` and `GET /audit/verify` for the audit screen.

Every domain mutation sends `station_id`. Login returns HTTP 204. Error handling maps the backend problem details to the FE error model.

## Architecture map

| Route | Feature | API module and main calls |
|---|---|---|
| `/` | Shell and home | `src/lib/api`, `GET /session` |
| `/masuk` | Login | `src/lib/session`, `POST /login` |
| `/shift` | Shift list and open | `src/features/shift-entry`, `GET /shifts`, `POST /shifts` |
| `/shift/{shiftId}` | Draft entry | `src/features/shift-entry`, `GET /shifts/{id}`, `/drafts/*`, `/submissions` |
| `/governance` | Amendments and acknowledgement | `src/features/governance`, `/amendments`, `/reports/{id}/acknowledgement` |
| `/laporan` | Report list | `src/features/report`, `GET /shifts` and report data |
| `/laporan/{reportId}` | Report detail | `src/features/report`, `GET /reports/{id}` |
| `/kebijakan` | Policy history and revision | `src/features/policy`, `GET /policies/history`, `POST /policies/revisions` |
| `/audit` | Audit list and verification | `src/features/audit`, `GET /audit`, `GET /audit/verify`, export |
| `/anomali` | Anomaly list | `src/features/anomaly`, `GET /anomalies` |
| `/backfill` | Backfill request | `src/features/backfill`, backfill API calls |
| `/pengaturan` | Settings | Session and shell settings |

## S5 integration report

Run date: 2026-09-15. Command:

```sh
npm run test:e2e:integration
```

Result: 6 passed, 0 failed, 1 worker. The cases are:

| Case | Result |
|---|---|
| S5.1 Login reaches the authenticated home page | PASS |
| S5.2 Open a shift, write one reading and one sale, then submit | PASS |
| S5.3 Shift list shows a submitted shift | PASS |
| S5.4 Governance queue reads a pending amendment and rejects it | PASS |
| S5.5 Laporan detail reads the submitted reading and sale | PASS |
| S5.6 Audit list reads live submission events | PASS |

The new backend shift detail contract returns the draft identity and revision. It does not return the catalog rows that the old UI-driven draft test needs. Therefore S5.2 uses the real backend API helper to write the reading and sale. The browser opens the shift and verifies the submitted state.

The full old reference suite is not ported. Skipped cases need endpoints or flows that are not in the new contract. These include the old draft-list endpoint, draft preview, unsupported master-data setup, test-only anomaly and concurrency hooks, and the old full amendment and evidence workflows. The focused cases above cover the supported high-value read and write paths.

## Phase log

- S0 complete: created the SvelteKit shell, API client, test setup, and base route.
- S1 complete: added login, logout, session loading, and idle-session handling.
- S2 complete: added shift opening, draft readings, sales, losses, evidence, and submission.
- S3 complete: added governance queues, amendment actions, acknowledgement, and anomaly reads.
- S4 complete: added laporan, kebijakan, audit, backfill, and pengaturan screens.
- S5 complete: added the real-backend Docker Compose harness, six focused integration cases, and this handover.
