# C06 - Three official-source examples

Reviewed and loaded 23 October 2026. Data and short evidence are in
`docs/data/verified-examples.json`. The loader uses C05 create/submit/review/publish,
so the records have a reviewer, review time, versions and audit history. It does not
publish by bypassing the editorial API. Examples are actual programme/award/intake
combinations, not broad scholarship brands. Eligibility is not certified for a user.

## Verified sources and uncertainty

- Oxford MSc Advanced Computer Science / Clarendon / 2027-28: the [course page](https://www.ox.ac.uk/admissions/graduate/courses/msc-advanced-computer-science)
  identifies the intake, Open state and January closing time. [Clarendon guidance](https://www.ox.ac.uk/admissions/graduate/fees-and-funding/funding/clarendon/applicants)
  supplies automatic consideration and fee/living support. The next intake's stipend
  amount is not copied from an older year's rate; other funding components stay Unknown.
- ETH MSc Computer Science / ESOP / autumn 2027: [programme](https://ethz.ch/en/studies/master/degree-programmes/engineering-sciences/computer-science.html),
  [ESOP](https://ethz.ch/students/en/studies/financial/scholarships/excellencescholarship.html/),
  and [2027 application dates](https://ethz.ch/en/studies/master/application/dates.html).
  Announced is recorded at review time. Central admissions explicitly says AM/CET,
  avoiding the common mistake of turning its midday cutoff into 23:59.
- Cambridge MPhil Advanced Computer Science / Gates / Michaelmas 2027:
  [course directory](https://www.postgraduate.study.cam.ac.uk/courses/directory/cscsmpacs/apply),
  [department](https://www.cst.cam.ac.uk/admissions/acs), and [funding guidance](https://www.cst.cam.ac.uk/postgraduate-admissions/getting-funding).
  Admission remains date-only. Conflicting December funding guidance is stored verbatim
  in short fragments plus a warning, with Unknown precision and no computed instant.
  Gates' current component amounts/coverage were not independently confirmed, so all
  six components stay Unknown. Source conflict needs provider confirmation.

Evidence labeled 'Reviewer summary' is a paraphrase; remaining entries are short quotes.
Opening states are snapshots at review time, not an automatic live guarantee.

## Verification and repeatability

The explicit seed-examples.spec.ts operation passed, asserting all three are published
with review timestamps. A repeat run verifies idempotence by retaining existing records
instead of overwriting them. The loader is skipped during normal tests. Run locally
from apps/web with SEED_EXAMPLES=1 and `npm.cmd run test:e2e -- seed-examples.spec.ts`.
It creates a local verified test reviewer via Mailpit and the operator role command.
Two fictional records left published by failed C05 tests were archived with audit
entries; no real records were changed by that cleanup.
