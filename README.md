# Scholarship Assistant

Local PostgreSQL/Mailpit services and a first fictional opportunity listing. The API exposes `GET /health` and `GET /api/v1/opportunities`.

## Prerequisites

- Node.js 22.17.1 or later 22.x and npm
- .NET SDK 10.0.100 or a later 10.0 feature band
- Docker Desktop with Linux containers and Docker Compose

## Local database and email sandbox

Start Docker Desktop, then from the repository root run:

```powershell
docker compose -f infra/compose.yaml -p scholarship up -d --wait
dotnet tool restore
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet tool run dotnet-ef -- database update --project src/Scholarship.Infrastructure --startup-project src/Scholarship.Api --configuration Release
```

The local PostgreSQL database is on `127.0.0.1:5433`. Mailpit's inbox is at `http://127.0.0.1:8025`; its SMTP port is `127.0.0.1:1025`.

Open the database UI at `http://127.0.0.1:5050`. Sign in to pgAdmin with `admin@scholarship.dev` / `local_admin_only`, open **Scholarship local**, and enter the database password `local_dev_only` when prompted. In pgAdmin, use the container host `postgres` and port `5432`; the host-machine address `127.0.0.1:5433` is for tools running outside Docker.

The credentials in Compose and `appsettings.Development.json` are for local development only. The F03 migration creates `OpportunityCycles` and seeds one clearly fictional example.

To stop the services without deleting the database volume:

```powershell
docker compose -f infra/compose.yaml -p scholarship down
```

## Run locally (PowerShell)

In one terminal:

```powershell
dotnet run --project src/Scholarship.Api
```

In another terminal:

```powershell
cd apps/web
npm.cmd ci
npm.cmd run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). The page fetches the fictional listing through Vite's API proxy. Check the API at `http://127.0.0.1:5080/health` and `http://127.0.0.1:5080/api/v1/opportunities`.

## Build

```powershell
dotnet build src/Scholarship.Api/Scholarship.Api.csproj
dotnet build src/Scholarship.Worker/Scholarship.Worker.csproj
cd apps/web
npm.cmd ci
npm.cmd run build
```

## F04 frontend conventions

The local preview now includes a searchable fictional listing, About route, form validation,
and loading/error/retry/empty states. Search filters the loaded sample only; nothing is saved.

With the API running in Development, open http://127.0.0.1:5080/swagger to try endpoints.
The OpenAPI document is at http://127.0.0.1:5080/openapi/v1.json. Both are disabled in Production.

From `apps/web`:

```powershell
npm.cmd run api:refresh # Fetch live schema and regenerate contracts after API changes
npm.cmd run api:generate # Regenerate from the checked-in openapi.json without a running API
npm.cmd run build
npm.cmd exec playwright install chromium
npm.cmd run test:e2e # Requires API + PostgreSQL; starts Vite automatically
```

Alternatively use installed Edge: `$env:PLAYWRIGHT_CHANNEL = 'msedge'` before the test command.
The tests expect the single fictional seed in the local development database.

Conventions: React Router owns page routes; TanStack Query owns API state; `src/lib/api.ts`
wraps openapi-fetch using generated contracts. React Hook Form + Zod validate the local search.
Tailwind 4 styles the app; the adapted shadcn-style Button/Input source lives in
`src/components/ui`, with `cn` and `components.json` for extending the component set.
Do not edit `api.generated.ts` manually. The current DTO has required string/UUID/boolean
fields; dates, nullable fields and enums are not yet part of this contract.

Manual check: search for an absent title, clear it, enter over 80 characters, navigate to
About and back, and stop/restart the API then use Try again. Reports: `docs/f04-report.md`
and `docs/f09-report.md`.
