# Current task: F01 — Set up repository and projects

Status: **Complete**. Next task: **F02 — Start local database and email sandbox**.

## Scope

Create the repository instructions, handoff, React/Vite/TypeScript placeholder, ASP.NET Core 10 API/Core/Infrastructure/Worker projects, project references, pinned dependency files, startup instructions, and a health endpoint. No product features or service integrations are included.

## Completion criteria

- React/Vite/TypeScript frontend builds.
- ASP.NET API, Core, Infrastructure, and Worker build.
- Versions are pinned and an npm lockfile is present.
- README gives working local startup commands.

## Verification (20 October 2026)

- Git initialized locally: passed.
- `npm.cmd ci --ignore-scripts --no-audit --no-fund --cache .npm-cache`: passed, with an engine warning because installed Node is v22.17.1 instead of required Node 24.
- `npm.cmd run build`: passed with Node v22.17.1; rerun on Node 24 before accepting F01.
- `dotnet build src/Scholarship.Api/Scholarship.Api.csproj`: blocked. `global.json` requests SDK 10.0.100; only SDK 8.0.417 and 8.0.426 are installed.
- `dotnet build src/Scholarship.Worker/Scholarship.Worker.csproj`: blocked for the same reason. Core and Infrastructure are referenced by those builds, so their compilation remains unverified.

Historical note: the initial toolchain lacked the then-selected Node 24 and .NET 10 SDK. The user subsequently selected Node 22, and .NET 10 was installed.

## Verification (21 October 2026)

- Git repository is now owned by `RHODAS-LAPTOP\rhoda`; no commits or remotes yet.
- .NET SDK 10.0.402 is installed. `global.json` now allows compatible .NET 10 feature-band updates.
- API and Worker builds passed with zero warnings/errors; both compiled their Core and Infrastructure references.
- Frontend `npm ci` passed on Node 22.17.1 with an engine warning. The default Vite config loader failed with an access-denied path error; `vite build --configLoader runner` passed. The package build script now uses that loader, but has not yet been rerun after the edit.
- At this point Node 24 was the selected runtime; this was superseded by the user's Node 22 decision below.
- API launch URL is now stored in `src/Scholarship.Api/Properties/launchSettings.json`; `dotnet run --project src/Scholarship.Api` listened on `http://127.0.0.1:5080`, and `GET /health` returned `{"status":"healthy"}`.

## Final verification (21 October 2026)

- Node 24.22.0 is installed at `C:\Program Files\nodejs`; the current shell's PATH still selects Node 22.17.1 from nvm. An isolated copy of the frontend source and lockfile passed `npm ci` and `npm run build` under Node 24.22.0.
- API and Worker Release builds passed on .NET SDK 10.0.402 with zero warnings/errors. Core and Infrastructure compiled through their project references.
- The API ran using its launch settings, and `/health` returned HTTP 200 with `{"status":"healthy"}`.
- A second Debug API build failed because an existing API process held its executable open. A subsequent Release build passed. `npm ci` in `apps/web` likewise could not replace a locked `esbuild.exe`, leaving that local `node_modules` incomplete. Stop running frontend processes and rerun `npm.cmd ci` before using the local web workspace; the isolated Node 24 install/build passed.
- Git is initialized under `rhoda`. There is no commit or remote yet; publishing remains a separate user action.

## Stack update (21 October 2026)

- The user selected Node 22. The blueprint, README, frontend manifest and lockfile now specify Node 22.17.1 or later 22.x.
- The current shell selects Node 22.17.1 through nvm. A clean `npm ci` and `npm run build` passed under Node 22.17.1 in an isolated copy using the updated manifest and lockfile.

## Security maintenance (21 October 2026)

- Pinned Vite 7.3.7 in the frontend manifest and lockfile to address the reported Vite 7.1.12 advisories.
- With Node 22.17.1, `npm.cmd ci`, `npm.cmd run build`, and `npm.cmd audit --audit-level=high` passed in `apps/web`; the audit reported zero vulnerabilities.
