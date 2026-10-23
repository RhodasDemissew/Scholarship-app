# F01 report — project foundation

## Goal and result

F01 created a small repository that can build a React frontend and four .NET projects. It has a placeholder page and a backend health endpoint. F01 is complete; F02 is the local PostgreSQL and Mailpit setup.

## What was created

| File or folder | Purpose |
| --- | --- |
| `AGENTS.md` | Instructions for later Codex sessions to stay within the selected task. |
| `docs/current-task.md` | Status, scope, criteria, checks and handoff. |
| `docs/ideas.md` | Empty backlog; ideas are not approved work. |
| `apps/web/` | React 19, TypeScript and Vite 7 placeholder app. |
| `apps/web/package-lock.json` | Exact resolved npm dependency tree for repeatable installs. |
| `src/Scholarship.Api/` | ASP.NET Core 10 web process with `GET /health`. |
| `src/Scholarship.Core/` | Empty domain project for future business rules. |
| `src/Scholarship.Infrastructure/` | Empty adapter project for future persistence and services. |
| `src/Scholarship.Worker/` | Minimal executable placeholder for later background work. |
| `global.json` | Selects .NET SDK 10.0.100 or a compatible later .NET 10 feature band. |
| `Directory.Packages.props` | Enables central NuGet package version management when packages are added. |
| `.gitignore` | Keeps build output, dependencies, local settings and secrets out of Git. |
| `README.md` | Exact local build and startup commands. |

## How the pieces connect

The browser loads the React app from Vite during development. Vite proxies `/api` and `/health` to the API on `127.0.0.1:5080`. The API port lives in `src/Scholarship.Api/Properties/launchSettings.json`, so `dotnet run --project src/Scholarship.Api` needs no URL argument. The API references Core and Infrastructure; Infrastructure references Core. The Worker references Core and Infrastructure but does no scheduled work yet.

No database, authentication, scholarships, scraping, notifications, AI or deployment code was added.

## Build and run

From the repository root, build the backend with:

```powershell
dotnet build src/Scholarship.Api/Scholarship.Api.csproj
dotnet build src/Scholarship.Worker/Scholarship.Worker.csproj
```

Build the frontend with:

```powershell
cd apps/web
npm.cmd ci
npm.cmd run build
```

Run the API in one terminal and the web app in another:

```powershell
dotnet run --project src/Scholarship.Api
```

```powershell
cd apps/web
npm.cmd run dev
```

Vite prints the frontend address. Visit `http://127.0.0.1:5080/health` to check the backend. Stop running development processes before rerunning `npm.cmd ci` or rebuilding the same Debug API executable on Windows, since locked files can prevent replacement.

## Verification and current local state

On 21 October 2026, the API and Worker passed Release builds on .NET SDK 10.0.402 with zero warnings or errors. Their references compiled Core and Infrastructure. The API ran and `/health` returned HTTP 200 with `{"status":"healthy"}`. The frontend source and lockfile passed `npm ci` and `npm run build` in an isolated folder under Node 24.22.0. The build script uses Vite's runner config loader because its default config loader encountered an access-denied path error in this workspace.

The user subsequently selected Node 22 as the project runtime. The README, manifest, lockfile and blueprint now specify Node 22.17.1 or later 22.x. A clean `npm ci` and `npm run build` passed under Node 22.17.1 in an isolated copy. The latest `npm ci` attempt in `apps/web` hit a locked `esbuild.exe` and left that local `node_modules` incomplete; close running Vite processes and rerun `npm.cmd ci` there.

Git is local and owned by `rhoda`, with no commit or remote. Publishing has not occurred.

After the initial report, Vite was updated from 7.1.12 to 7.3.7 in the frontend manifest and lockfile in response to npm security advisories. On Node 22.17.1, a clean install and build passed in `apps/web`, and `npm audit --audit-level=high` reported zero vulnerabilities.

## Evidence reconciliation - 23 October 2026

F01 is now checked in the checklist. Node 22.17.1 clean `npm ci` and production build
passed in apps/web; npm reported zero vulnerabilities. API and Worker Release builds
passed with zero warnings/errors and compiled Core/Infrastructure. The README startup
flow ran against Docker PostgreSQL and was verified in an actual browser. Package
versions remain pinned with the npm lockfile and central NuGet versions. This resolves
the earlier unchecked tracker row and stale node_modules warning. F04's frontend build
has two non-blocking upstream Zod comment-annotation warnings.
