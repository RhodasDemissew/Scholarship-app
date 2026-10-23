# C07 - Public explorer and opportunity detail

Completed 23 October 2026. The public page now shows reviewed real records by default,
with server-side text/country/intake/opening/tuition filters, deterministic pagination
and bounded page sizes (1-100). Country/intake options come from published data. Filter
state stays in the URL. Detail pages expose official links, original deadline wording,
precision/zone uncertainty, six funding components, source evidence and review dates.
Records older than seven days carry a source-recheck label. Fictional data is separated
by an explicit API filter. Non-published detail records return 404.

Verification: API Release and frontend builds passed. Generated OpenAPI contracts now
use strict JSON numeric types and string-only enums. Four Playwright checks passed for
real data, validation, filters, distinct pages, page-size rejection, deep-link reload,
Cambridge uncertainty, official links, loading/failure/retry/empty states and Swagger.
An initial run overlapped an API restart and failed; the completed stable run passed.
Label names were made explicit for filter controls. Existing workflow/seed tests were
updated to consume the paginated envelope rather than the old array response.

Try /, filter Switzerland, open ETH details, then search Cambridge and read its funding
deadline conflict. All current values are review snapshots; source links remain authoritative.
