# Current task: F02 — Start local database and email sandbox

Status: **Complete** (21 October 2026). Next task: **F03 — Build the first end-to-end listing**.

## Scope

Run PostgreSQL 17 and Mailpit locally with Docker Compose. Configure EF Core 10 with the Npgsql provider, pin package and local EF CLI versions, and apply an initial migration to a fresh database. No catalogue or email-delivery feature is implemented in F02.

## Completion criteria

- Docker Compose starts PostgreSQL and Mailpit.
- An EF migration creates a fresh local database.

## Verification results

- `docker compose -f infra/compose.yaml -p scholarship ps`: PostgreSQL 17.11 and Mailpit v1.31.5 both healthy; ports are bound to `127.0.0.1` only.
- `dotnet tool run dotnet-ef -- database update --project src/Scholarship.Infrastructure --startup-project src/Scholarship.Api --configuration Release`: applied `20261021085336_InitialDatabase` to the newly created `scholarship_dev` database.
- `dotnet tool run dotnet-ef -- migrations list ...`: listed `20261021085336_InitialDatabase` as applied. PostgreSQL contains `__EFMigrationsHistory`.
- Mailpit's local web UI at `http://127.0.0.1:8025/` returned HTTP 200.
- API and Worker Release builds passed with zero warnings or errors.
- Follow-up: pgAdmin 4 v9.18.0 runs at `http://127.0.0.1:5050`. Its browser page returned HTTP 302 to login, its preloaded server entry was imported, and a connection from its container to `scholarship_dev` succeeded.

## Handoff

The initial migration intentionally has no feature tables; F03 adds the first listing model and fixture. The database and pgAdmin have separate persistent Docker volumes. Mailpit is running but no application email sender is wired yet. The credentials in Compose and `appsettings.Development.json` are local-only. Use the README commands to restart services and apply migrations. Full reports are in `docs/f01-report.md` and `docs/f02-report.md`.
