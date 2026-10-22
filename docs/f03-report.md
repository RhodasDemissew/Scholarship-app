# F03 report — first database-backed listing

## Goal and result

F03 connects the first fictional opportunity cycle across PostgreSQL, the ASP.NET Core API, and React. The page includes loading, error, retry, and empty states. This is a demonstration record, not a verified scholarship listing. F03 is complete; F04 is next.

## What changed

| File | Purpose |
| --- | --- |
| `src/Scholarship.Core/OpportunityCycle.cs` | Defines the small cycle model shared with persistence. |
| `src/Scholarship.Infrastructure/Persistence/ScholarshipDbContext.cs` | Maps the model to `OpportunityCycles` and seeds one fictional row with a fixed ID. |
| `src/Scholarship.Infrastructure/Persistence/Migrations/20261021092859_FirstOpportunityCycle.cs` | Creates the table and inserts that row. EF also updated its model snapshot and generated migration designer. |
| `src/Scholarship.Api/Program.cs` | Adds `GET /api/v1/opportunities`, which reads the table and returns a small JSON response. |
| `apps/web/src/main.tsx` and `style.css` | Fetch and display the response, with states for loading, failure, retry, and no results. |
| `README.md` | Documents the new endpoint and local page. |

## How the request flows

1. The EF migration creates `OpportunityCycles` in PostgreSQL and inserts `Example Master's Scholarship` for `Fictional Example University`.
2. `ScholarshipDbContext` maps that table to .NET objects. The API queries it with `AsNoTracking()` because this endpoint only reads data.
3. The API returns JSON from `GET /api/v1/opportunities`. The response contains the ID, title, institution, intake label, and `isFictional` flag.
4. React calls `/api/v1/opportunities`. During local development, Vite forwards `/api` requests to the API at `127.0.0.1:5080`, so the frontend does not need a separate API URL in its fetch call.
5. React first shows “Loading opportunities…”. On success it renders the cycle with a “Fictional demo” badge. On failure it shows an error and a **Try again** button. A successful empty response shows an empty message.

The migration gives everyone who applies it the same demonstration record. The fixed ID prevents a different seed identity from being generated on each machine. The later catalogue tasks will expand this simplified model to represent real programmes, awards, evidence, and publication rules.

## Run it locally

Start Docker Desktop. From the repository root, start the services and apply migrations:

```powershell
docker compose -f infra/compose.yaml -p scholarship up -d --wait
dotnet tool restore
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet tool run dotnet-ef -- database update --project src/Scholarship.Infrastructure --startup-project src/Scholarship.Api --configuration Release
```

Run the API in one terminal:

```powershell
dotnet run --project src/Scholarship.Api
```

Run the frontend in another terminal:

```powershell
cd apps/web
npm.cmd run dev
```

Open the URL Vite prints, normally `http://localhost:5173`. The API JSON is also available at `http://127.0.0.1:5080/api/v1/opportunities`. You can inspect the table in pgAdmin at `http://127.0.0.1:5050` or connect with DBeaver as described in the F02 report.

To check the error state manually, stop the API and refresh the frontend. Start the API again and press **Try again**.

## Verification on 21 October 2026

- The F03 migration applied to the local PostgreSQL database.
- The API returned the seeded fictional row, and `/health` returned healthy.
- Vite's `/api` proxy returned the same row while the API was running. After the API was stopped, that request returned HTTP 500; React treats non-success responses as errors.
- API and Worker Release builds passed with zero warnings and errors. The frontend TypeScript and Vite production build passed.
- Visual rendering in a browser was **not checked** because this session had no available browser surface. The manual page check above remains useful.

F03 did not add authentication, real scholarship data, Swagger UI, a generated API client, or other F04 features.
