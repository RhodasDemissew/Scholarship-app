# F02 report — local database and email sandbox

## Goal and result

F02 makes the local infrastructure needed by later features available: PostgreSQL 17 for application data and Mailpit for captured development email. A follow-up added pgAdmin as a browser-based database client. Docker Compose started the services, and EF Core applied an initial migration to a fresh database. F02 is complete. The next task is F03, the first database-backed listing.

## What was added

| File | Purpose |
| --- | --- |
| `infra/compose.yaml` | Defines pinned PostgreSQL 17.11, Mailpit v1.31.5 and pgAdmin 4 v9.18.0 containers, local ports, a PostgreSQL health check and persistent volumes. |
| `infra/pgadmin/servers.json` | Preloads the local PostgreSQL connection in pgAdmin without storing its password. |
| `Directory.Packages.props` | Pins EF Core Design 10.0.12 and the Npgsql EF provider 10.0.3 centrally. |
| `dotnet-tools.json` | Pins the repository's `dotnet-ef` migration tool to 10.0.12. |
| `src/Scholarship.Infrastructure/Persistence/ScholarshipDbContext.cs` | Defines the EF Core context that future database entities will use. |
| `src/Scholarship.Infrastructure/Persistence/Migrations/` | Contains the initial migration and EF model snapshot. |
| `src/Scholarship.Api/appsettings.Development.json` | Supplies a local-only PostgreSQL connection string. |
| `src/Scholarship.Api/Program.cs` | Registers the EF context with the Npgsql provider and tells EF where migrations live. |
| `README.md` | Gives startup, migration and shutdown commands. |

## How it works

Docker Compose starts PostgreSQL, Mailpit and pgAdmin as separate containers. PostgreSQL stores data in a named Docker volume, so stopping the containers does not erase the database. The database is available on `127.0.0.1:5433`; container port 5432 is mapped to local port 5433. Mailpit exposes an SMTP sink on `127.0.0.1:1025` and an inbox page at `http://127.0.0.1:8025`. pgAdmin is at `http://127.0.0.1:5050`. All published ports bind to the local machine only.

PostgreSQL is the database server. pgAdmin and DBeaver are clients for viewing tables and running SQL against it. In a desktop client such as DBeaver, connect to host `127.0.0.1`, port `5433`, database `scholarship_dev`, user `scholarship_dev`, password `local_dev_only`. pgAdmin runs inside Compose, so its preloaded connection instead uses host `postgres` and port `5432`. Sign in to pgAdmin with `admin@scholarship.dev` / `local_admin_only`; when opening the preloaded server, enter `local_dev_only` for PostgreSQL. pgAdmin keeps its own settings in a separate named volume.

EF Core is the .NET layer for defining and migrating database tables. Npgsql connects EF Core to PostgreSQL. The API reads the development connection string and registers `ScholarshipDbContext`; the local `dotnet-ef` tool applies migration files to the database. This first migration has no feature tables: applying it creates the database and EF's `__EFMigrationsHistory` table. F03 will add the first listing table and fixture.

Mailpit captures email locally, but the application has no email sender yet. The Compose password is deliberately for local development; it must not be reused outside this setup.

## Run and inspect

Start Docker Desktop. From the repository root:

```powershell
docker compose -f infra/compose.yaml -p scholarship up -d --wait
dotnet tool restore
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet tool run dotnet-ef -- database update --project src/Scholarship.Infrastructure --startup-project src/Scholarship.Api --configuration Release
```

Inspect the services and migration:

```powershell
docker compose -f infra/compose.yaml -p scholarship ps
dotnet tool run dotnet-ef -- migrations list --project src/Scholarship.Infrastructure --startup-project src/Scholarship.Api --configuration Release
```

Open `http://127.0.0.1:8025` for Mailpit or `http://127.0.0.1:5050` for pgAdmin. To stop the containers while keeping their volumes:

```powershell
docker compose -f infra/compose.yaml -p scholarship down
```

## Verification on 21 October 2026

- PostgreSQL and Mailpit containers reached healthy status.
- EF applied `20261021085336_InitialDatabase` to a fresh `scholarship_dev` database; `migrations list` reported it as applied, and PostgreSQL showed `__EFMigrationsHistory`.
- Mailpit's inbox page returned HTTP 200.
- The API and Worker passed Release builds with zero warnings and zero errors.
- Follow-up: pgAdmin started, imported the preconfigured local server, returned HTTP 302 to its login page, and its container connected to `scholarship_dev`.

No catalogue record was created and no email was sent. Those behaviors belong to later tasks.
