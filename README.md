# Scholarship Assistant

Project foundation and local PostgreSQL/Mailpit services. The frontend is a placeholder and the API exposes `GET /health`.

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

The credentials in Compose and `appsettings.Development.json` are for local development only. The initial migration creates EF's migration history; feature tables begin in later tasks.

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

Open the URL printed by Vite. Check the API at `http://127.0.0.1:5080/health`.

## Build

```powershell
dotnet build src/Scholarship.Api/Scholarship.Api.csproj
dotnet build src/Scholarship.Worker/Scholarship.Worker.csproj
cd apps/web
npm.cmd ci
npm.cmd run build
```
