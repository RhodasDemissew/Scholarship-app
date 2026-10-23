# Current task: F04 / F09 - local foundation complete

Status: Complete, 23 October 2026. Next selected task: C01 - Implement signup and secure sessions.

## Completed scope

F04 installed and demonstrated the approved frontend conventions in a visible sample
listing/search flow, with generated OpenAPI client and development Swagger UI. F01's
completion evidence was reconciled. F09 passed the local foundation gate, including
fresh isolated database migrations and the outstanding F03 rendered-browser check.

## Verification and reports

API/Worker Release builds and clean frontend install/build passed. Four Edge browser
tests passed, covering live listing, validated search, navigation, loading/error/retry,
empty results and Swagger execution. Screenshots reviewed; no horizontal overflow at
320/768/1440px. Production documentation routes return 404. Two non-blocking upstream
Zod bundler-comment warnings remain. Reports: docs/f01-report.md, docs/f04-report.md,
docs/f09-report.md. Repeatable commands are in README.md.

## Handoff

Run Docker services, the API and Vite using README. Open http://127.0.0.1:5173 to test
and http://127.0.0.1:5080/swagger for endpoint testing. The isolated fresh-migration
database scholarship_f09_verify remains available for inspection.

C01 scope: Identity cookies, verification, login/logout and reset; React sends CSRF
tokens on unsafe requests. Read relevant blueprint sections before implementation.
Continue V1 locally through 1A-1D and L01 before 1E deployment. F05-F08 remain deferred.
Each completed checklist item receives its own report. Do not implement docs/ideas.md.
