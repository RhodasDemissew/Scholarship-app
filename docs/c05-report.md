# C05 - Manual editorial workflow

Completed 23 October 2026. /editor provides typed forms for programme/intake, deadline
precision, six funding components and field evidence. Editor+MFA endpoints enforce
Draft -> InReview -> Reviewed -> Published -> Archived. Corrections return a record to
Draft and clear its review timestamp. Known funding/deadline/opening claims require
field-specific evidence; overview evidence identifies the programme/award/intake.
Review records the actor and timestamp. Every change/transition writes an audit event
with action, version, status and changed field names. GUID optimistic concurrency and
transactions reject stale edits with HTTP 409. Shared identity mismatches are rejected
rather than silently changing other cycles. Workflow buttons require saved form values.

Verification: Release build, EditorialAudit migration, generated API contracts and
frontend production build passed. editorial.spec.ts passed the complete workflow,
private draft checks, duplicate 409, missing-evidence rejection, stale edit 409, actual
browser correction, audit field changes and archive. Tests caught/fixed EF state for
replacement children and empty successful API response handling in the access query.
No automatic publishing or direct entity binding is exposed. Sources are stored as
links/text; the API does not fetch arbitrary submitted URLs.

Try: sign in with a granted Editor role, complete MFA, open /editor, create a draft,
add evidence, save, submit, approve review, then publish. Reload on a conflict.
