# Scholarship Assistant

F01 project foundation. The frontend is a placeholder and the API exposes `GET /health`.

## Prerequisites

- Node.js 22.17.1 or later 22.x and npm
- .NET SDK 10.0.100 or a later 10.0 feature band

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
