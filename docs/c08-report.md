# C08 - Private saves and incorrect-information reports

Completed 23 October 2026. Applicants can save/remove real published opportunities and
view /saved. Ownership always comes from the authenticated Identity user, never a body
field. A composite primary key and PostgreSQL ON CONFLICT make repeated/concurrent saves
idempotent. Removing an absent save is also idempotent. Unpublished saved records reveal
only an unavailable label rather than private corrected content.

A validated report form accepts 1-1000 characters. Reports are stored for MFA-protected
editor review at /editor/reports; applicants cannot read the review queue. Reports do
not alter shared catalogue facts. A per-user daily report cap is enforced. Logout clears
client caches so another account does not inherit private results.

Verification: SavedOpportunitiesAndReports migration and API/frontend builds passed.
saved.spec.ts passed: anonymous denial, missing CSRF rejection, three concurrent saves
produce one row, two-account isolation, idempotent deletion, report validation, editor
queue denial for applicants, and browser shortlist/report interactions.

Try: sign in, open a real opportunity, save it, visit Shortlist, then report an incorrect
field. An editor can follow the report into the standard correction/review workflow.
