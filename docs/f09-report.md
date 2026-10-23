# F09 report - local foundation milestone

Completed 23 October 2026. Foundation items F01-F04 are verified; no deployment performed.

## Evidence

- Docker Compose started PostgreSQL, Mailpit and pgAdmin with healthy checks.
- Existing development database migration update passed.
- Created isolated database scholarship_f09_verify and applied both migrations from
  empty. SQL confirmed one seeded OpportunityCycles row. The normal development
  database was preserved. The isolated verification database remains for inspection.
- Clean frontend lockfile install and production build passed on Node 22.17.1.
- API and Worker Release builds passed and compiled Core/Infrastructure.
- Four Edge browser tests passed against the real local API/database, including the
  fictional listing, frontend conventions, failure recovery and Swagger execution.
- Actual rendered screenshots were reviewed at narrow and desktop widths, resolving
  F03's outstanding manual visual check. Layout overflow checks passed at 320/768/1440px.
- OpenAPI/Swagger return 404 outside Development.

An initial isolated DB command used the wrong role and failed; rerunning with the
configured scholarship_dev role succeeded. EF's initial missing-history-table probe
on the empty database is followed by successful migration application. A SQL quoting
attempt failed, then the seed-count check passed using stdin.

This is a foundation gate, not the later C09/O07 full accessibility and cross-browser
acceptance. No signup, real catalogue, matching or application tracking is implemented.
Next selected task: C01 (signup and secure sessions). See F04 report and README for
repeatable startup, generation, browser tests and manual checks.
