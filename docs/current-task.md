# Current task: F03 — Build the first end-to-end listing

Status: **Complete** (21 October 2026). Next task: **F04 — Configure frontend conventions**.

## Scope

Add one clearly fictional opportunity cycle to PostgreSQL with an EF Core migration, expose it through the API, and show it in React with loading, error, retry, and empty states. This is a small vertical slice; the full catalogue model belongs to later tasks.

## Completion criteria

- A fictional cycle is read from PostgreSQL through the API.
- React fetches and displays that cycle, with loading and error states.

## Verification results

- Migration `20261021092859_FirstOpportunityCycle` applied to the local PostgreSQL database.
- API `GET /api/v1/opportunities` returned the seeded fictional cycle; `GET /health` returned healthy.
- Vite proxy `GET /api/v1/opportunities` returned the same cycle while the API ran. With the API stopped, the proxy returned HTTP 500, exercising the response failure that React handles with its error and retry state.
- API and Worker Release builds passed with zero warnings or errors. Frontend `npm.cmd run build` passed.
- A visual browser check could not run because this session has no available browser surface. The React display and state transitions are implemented and compile, but their rendered appearance remains for a manual browser check.

## Handoff

Start Docker services and apply migrations using the README commands, then run the API and Vite in separate terminals. Open the Vite URL to check the fictional card and stop the API to check the error/retry state. The learning report is in `docs/f03-report.md`. F04 adds the planned frontend libraries, generated API client, and Swagger UI; no F04 tooling was added here.

## Execution order update — 23 October 2026

The selected next implementation task remains F04. Follow `docs/checklist.md`: complete V1 milestones 1A–1D locally, pass L01, then perform 1E deployment and hosted verification. Do not begin F05–F08 during foundation work. N02 and O01–O03 now cover local email/diagnostics/recovery; R01–R02 activate and verify the hosted equivalents. Task IDs and existing completion marks are preserved. F01 remains unchecked in the checklist and needs evidence reconciliation; this planning update does not certify it complete.

Planning verification: 94 unique task IDs (62 V1); all dependencies resolve with no cycles; no local task depends on a deployment task. No application code changed.
