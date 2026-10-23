# F04 report - frontend conventions

Completed 23 October 2026.

## Result

A visible local preview with a database-backed fictional listing, search/clear form,
About navigation and a not-found page. React Router 7, Tailwind 4, adapted shadcn-style
Button/Input primitives, TanStack Query 5, React Hook Form/Zod and openapi-fetch work
in the same flow. The form trims input, rejects over 80 characters and filters loaded
samples without saving data. No catalogue or account features from later tasks were added.

ASP.NET Core generates the OpenAPI document. TypedResults exposes the listing response
schema, openapi-typescript generates its TypeScript contract, and Query handles loading,
errors, cancellation and explicit retry. Swagger UI can execute the listing endpoint in
Development; both documentation endpoints return 404 in Production.

## Verification

- API and Worker Release builds: passed, zero warnings/errors.
- Clean npm ci and frontend production build: passed; npm reported zero vulnerabilities.
- Four Playwright tests in installed Microsoft Edge: live database listing, search/clear,
  validation, route reload, loading/503/retry recovery, empty response, missing route,
  and Swagger execution passed.
- Screenshots reviewed at 320 and 1440px; overflow checks at 320/768/1440px passed.
  Review caught wrapping desktop button labels; sizing was corrected and checks rerun.
- Live schema refresh and offline regeneration both passed.
- Current contract uses required strings, UUID and boolean. Enum/null/date transport
  checks belong with the later schema that introduces those fields.

## Issues encountered

The sandbox initially blocked package downloads; authorized network-enabled installs
succeeded. Resolver 6's optional peer dependencies conflicted, so compatible resolver 5
was pinned. The first browser run occurred before Chromium finished downloading and
could not launch; the completed checks used installed Edge. Frontend builds retain two
non-blocking Rollup warnings about comments in Zod, not application compilation errors.

## Try it

Follow README startup commands. Open http://127.0.0.1:5173 and search, clear, enter 81
characters, navigate About/back, then stop/restart the API to check Try again. Open
http://127.0.0.1:5080/swagger for manual endpoint testing. Run `npm.cmd run test:e2e`
from apps/web with the API/database available; set PLAYWRIGHT_CHANNEL=msedge to use Edge.

## References

- https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/overview?view=aspnetcore-10.0
- https://openapi-ts.dev/openapi-fetch/
- https://ui.shadcn.com/docs/installation/manual
