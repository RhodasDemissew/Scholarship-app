# C04 - Deadline precision and funding evidence

Completed 23 October 2026. Added per-cycle deadlines, six funding component kinds and
field evidence with source URL/excerpt/reviewer/time. Original deadline text remains
separate from normalized date/time/zone and optional UTC instant. Date-only deadlines
cannot acquire invented times or zones; unknown-zone times retain no UTC instant.
Funding coverage explicitly defaults to Unknown. Amount, currency and conditions remain
optional rather than implying full funding. Relational constraints prevent duplicate
component/deadline kinds per cycle.

Verification: DeadlineFundingEvidence migration applied; Release build passed.
`dotnet run --project tests/Scholarship.DomainChecks` passed nine checks: date-only,
invented end-of-day rejection, unknown zone, Addis conversion, DST ambiguity/gap,
invalid zone, unknown funding default and private draft default. Source-backed editor
validation and visible forms follow in C05; public rendering follows in C07.
