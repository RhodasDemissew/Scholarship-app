# Scholarship Assistant — Version Checklist

Prepared 20 October 2026 from Implementation Blueprint revision 1.2. Product releases below are distinct from the blueprint document's revision number. No implementation is marked complete.

## Release map

| Release | Blueprint phases | Outcome |
| --- | --- | --- |
| V1 | 0–3 | Complete pilot: catalogue, assisted URL imports, matching, application tracking and reminders |
| V2 | 4 | Automated discovery, scheduled rechecks and more sources |
| V3 | 5 | Private documents; AI is optional and separately gated |
| V4 | 6 | Choose expansions based on demand and measured load |

V1 has four internal milestones (1A–1D), not four separate public releases. Finish required V1 tasks before adding V2 scope. Tasks in a version may run concurrently when their dependencies are satisfied; Order is a suggested display order. V4 is a menu, not a commitment to implement every item.

## Import into Notion

**Recommended: import Scholarship_Assistant_Notion_Tracker.csv as a database.** On desktop/web, open Settings → Import → CSV and select the file. Map Name as the title. Import once into a new database; repeated imports can create duplicate tasks.

Suggested properties:

| Column | Property |
| --- | --- |
| Name | Title |
| Task ID, Done when, Depends on, Evidence / PR, Notes | Text |
| Version, Milestone, Phase, Area, Priority | Select |
| Status | Status, or Select if needed during import |
| Order | Number |

Set statuses to Backlog, Not started, In progress, Blocked, Review and Done. If importing produces text properties, configure their types afterward. Depends on contains task IDs as text: native relations and dependency behavior are not created by CSV. Add Owner and Due date yourself when you schedule work; neither has been invented.

Create these views after import:

- **V1 only:** filter Version = V1; sort Order ascending.
- **By version:** group by Version and sort by Order; use Milestone for finer grouping.
- **In progress:** filter Status = In progress.
- **Blocked:** filter Status = Blocked; record the blocker in Notes.
- **Board:** group by Status, filtered to the release you are working on.

For progress, count Done tasks against required tasks within the selected version. Optional tasks should not dilute V1 completion. Task counts are not time-weighted progress. CSV does not install formulas, relations or views; configure those in Notion if desired.

Alternatively import this Markdown file using Text & Markdown for a page organized by version. It uses standard task-list notation; inspect checkbox conversion after import and convert any plain-text items into To-do blocks if needed. Keep either the database or page as your primary tracker to avoid updating two copies.

Notion import reference (checked 20 October 2026): https://www.notion.com/help/import-data-into-notion

## Definition of done

Check an item only when its completion criterion is demonstrated, relevant failure paths are checked, and its evidence/PR or verification note is recorded. A release gate is a review of preceding work, not a substitute for it. Carry existing security, accessibility and recovery checks forward for every release. The approved stack remains React + ASP.NET Core + PostgreSQL on Contabo with Nginx, free-first for V1.

## V1 — 59 tracking items

### 1A Foundation (Phase 0)

- [ ] **F01 — Set up repository and projects**
  - Done when: React/Vite/TypeScript and ASP.NET API/Core/Infrastructure/Worker build; versions pinned and README runs locally.
  - Area: Engineering. Depends on: None.

- [ ] **F02 — Start local database and email sandbox**
  - Done when: Docker Compose starts PostgreSQL and Mailpit; migrations create a fresh database.
  - Area: Database. Depends on: F01.

- [ ] **F03 — Build the first end-to-end listing**
  - Done when: A fictional cycle is read from PostgreSQL through the API and shown in React with loading and error states.
  - Area: Catalogue. Depends on: F02.

- [ ] **F04 — Configure frontend conventions**
  - Done when: Router, Tailwind/shadcn, Query, Hook Form/Zod and generated OpenAPI client work in a sample flow; Swagger UI serves the API's OpenAPI document in development for manual endpoint testing.
  - Area: Frontend/API tooling. Depends on: F03.

- [ ] **F05 — Deploy staging on Contabo**
  - Done when: Nginx serves built React and proxies API; DB is private; staging data/secrets are isolated.
  - Area: Deployment. Depends on: F03.

- [ ] **F06 — Configure HTTPS and host protection**
  - Done when: TLS renewal tested; SSH/firewall and Docker port exposure checked; trusted proxy headers configured.
  - Area: Security. Depends on: F05.

- [ ] **F07 — Configure CI and release rollback**
  - Done when: CI builds/tests; secrets excluded; immutable releases and a tested rollback procedure exist.
  - Area: Engineering. Depends on: F05.

- [ ] **F08 — Verify budget and service access**
  - Done when: VPS/domain/payment access, free-tier limits and off-server backup target are recorded; no paid AI dependency.
  - Area: Operations. Depends on: F01.

- [ ] **F09 — Pass foundation milestone**
  - Done when: Deployed UI reads the database; fresh local setup and rollback demonstrated.
  - Area: Release gate. Depends on: F04;F06;F07;F08.

### 1B Catalogue and imports (Phase 1)

- [ ] **C01 — Implement signup and secure sessions**
  - Done when: Identity cookies, verification, login/logout and reset work; React sends CSRF tokens on unsafe requests.
  - Area: Accounts. Depends on: F09.

- [ ] **C02 — Protect accounts and editor access**
  - Done when: Applicant/editor/admin permissions, admin MFA, auth throttling and persistent encrypted login keys verified.
  - Area: Security. Depends on: C01.

- [ ] **C03 — Model opportunities by intake and round**
  - Done when: Institution/programme/award/cycle models prevent duplicate identities and retain separate publication/opening states.
  - Area: Database. Depends on: F09.

- [ ] **C04 — Store deadlines and funding evidence**
  - Done when: Original deadline wording, precision and timezone retained; tuition/stipend/travel etc. use explicit unknown states.
  - Area: Catalogue. Depends on: C03.

- [ ] **C05 — Build manual entry and publication workflow**
  - Done when: Editor can draft/review/publish/correct/archive; drafts are private; evidence, audit and version conflict checks work.
  - Area: Admin. Depends on: C02;C04.

- [ ] **C06 — Add three verified examples**
  - Done when: Three real programme/award/intake records checked against official sources; uncertain facts remain flagged.
  - Area: Catalogue. Depends on: C05.

- [ ] **C07 — Build explorer and opportunity detail**
  - Done when: Paginated filters, coverage, official links, source evidence, opening state and last-reviewed date displayed.
  - Area: Frontend. Depends on: C05.

- [ ] **C08 — Add saves and error reports**
  - Done when: Save/unsave is user-owned and idempotent; applicant can flag incorrect information.
  - Area: Applications. Depends on: C07;C01.

- [ ] **C09 — Build responsive shell and accessible forms**
  - Done when: 320–2560 CSS px and intermediate widths work; zoom, keyboard, long text and errors do not break layouts.
  - Area: Frontend. Depends on: F04;C07.

- [ ] **C10 — Provide public sample journey**
  - Done when: Clearly fictional profile/demo can be explored without signup; visitors cannot edit shared catalogue data.
  - Area: Demo. Depends on: C07.

- [ ] **D01 — Approve 2–3 source patterns**
  - Done when: Specific static HTML domains/paths, access conditions and extractable fields documented; no unsupported-site promise.
  - Area: Imports. Depends on: C06.

- [ ] **D02 — Implement bounded safe fetching**
  - Done when: HTTPS allowlist, redirect/DNS checks, private-address rejection, time/size/concurrency caps and backoff verified.
  - Area: Security. Depends on: D01.

- [ ] **D03 — Create durable import worker and jobs**
  - Done when: Editor request returns 202 after persistence; Quartz/job leases recover after restart; retries are bounded.
  - Area: Imports. Depends on: D02.

- [ ] **D04 — Implement first source adapter**
  - Done when: One supported page yields draft fields with excerpts, parser version, intake and explicit missing values.
  - Area: Imports. Depends on: D03.

- [ ] **D05 — Complete 2–3 static source adapters**
  - Done when: Each approved pattern has extraction fixtures; changed layouts fail visibly rather than inventing facts.
  - Area: Imports. Depends on: D04.

- [ ] **D06 — Build import review and publication handoff**
  - Done when: Editor sees proposed values/evidence/diffs, corrects and accepts/rejects; acceptance creates a draft only.
  - Area: Admin. Depends on: D04;C05.

- [ ] **D07 — Handle duplicate and stale imports**
  - Done when: Repeated URLs do not duplicate cycles; ambiguous intake and newer editorial versions block unsafe updates.
  - Area: Imports. Depends on: D06.

- [ ] **D08 — Add import controls and manual fallback**
  - Done when: Job status/retry/disable controls work; unsupported or broken source directs editor to manual entry without fetching.
  - Area: Admin. Depends on: D05;D06.

- [ ] **D09 — Verify importer failure cases**
  - Done when: Private redirects, old year, missing evidence, conflicting dates, crashes and unauthorized imports tested.
  - Area: Testing. Depends on: D07;D08.

- [ ] **C11 — Seed initial verified catalogue**
  - Done when: At least 10 reviewed opportunities published; expand toward 20–30 only with sustainable review capacity.
  - Area: Content. Depends on: C06;D09.

- [ ] **C12 — Pass catalogue and import milestone**
  - Done when: Browse/save, manual entry, 2–3 adapters, review/publish and responsive demo all pass.
  - Area: Release gate. Depends on: C08;C09;C10;C11.

### 1C Personal assistant (Phase 2)

- [ ] **M01 — Build progressive applicant profile**
  - Done when: Nationality and residence separate; education, original GPA scale, graduation, experience, English evidence and preferences stored.
  - Area: Profile. Depends on: C12.

- [ ] **M02 — Implement typed eligibility rules**
  - Done when: ALL/ANY rules support Meets, DoesNotMeet, NeedsConfirmation and MissingInformation; no source code execution.
  - Area: Matching. Depends on: M01.

- [ ] **M03 — Test difficult eligibility cases**
  - Done when: GPA equivalence, MOI ambiguity, overlapping experience, age cutoff and final-year exceptions evaluated conservatively.
  - Area: Matching. Depends on: M02.

- [ ] **M04 — Display matches with evidence**
  - Done when: Requirement explanations link to sources; preference fit and task readiness are separate; no success probability.
  - Area: Frontend. Depends on: M03.

- [ ] **M05 — Version and refresh match results**
  - Done when: Profile/rule changes mark results stale; re-evaluation uses current versions and preserves unknown coverage.
  - Area: Matching. Depends on: M04.

- [ ] **A01 — Build versioned task templates**
  - Done when: Admission/funding tracks and acyclic dependencies represented; each cycle has a clear preparation sequence.
  - Area: Applications. Depends on: C12.

- [ ] **A02 — Create private application workspaces**
  - Done when: Idempotent creation; tasks, notes, due dates and statuses are owner-protected; template changes preserve progress.
  - Area: Applications. Depends on: A01;M01.

- [ ] **A03 — Track reference requirements**
  - Done when: Contact details, requests and receipt statuses distinguished; uploaded-letter assumptions avoided; no automatic referee contact.
  - Area: Applications. Depends on: A02.

- [ ] **A04 — Add reusable details and readiness checklist**
  - Done when: Education/work/activity fields reusable; documents tracked as readiness metadata without uploads.
  - Area: Applications. Depends on: A02.

- [ ] **A05 — Build dashboard and next-action guidance**
  - Done when: User sees tracked applications, blocked tasks, approaching deadlines and next action; official portal opens for submission.
  - Area: Frontend. Depends on: A02;M04.

- [ ] **A06 — Add calendar export and manual outcomes**
  - Done when: Calendar reflects known date precision; submitted/awarded/not-selected/withdrawn status is user-reported.
  - Area: Applications. Depends on: A05.

- [ ] **A07 — Verify ownership and full demo journey**
  - Done when: Two-user access tests pass; three sample profiles show different eligibility outcomes; stale edits handled.
  - Area: Testing. Depends on: M05;A03;A04;A06.

- [ ] **A08 — Pass personal assistant milestone**
  - Done when: Applicant completes profile, understands uncertainty and manages an application plan independently.
  - Area: Release gate. Depends on: A07.

### 1D Pilot and public release (Phase 3)

- [ ] **N01 — Add durable notification outbox**
  - Done when: Transactional events, leases, retry limits and failed-delivery review survive restarts; import jobs cannot starve reminders.
  - Area: Notifications. Depends on: A08;D03.

- [ ] **N02 — Configure transactional email delivery**
  - Done when: Verified sending domain and SPF/DKIM/DMARC; idempotent sends, signed webhooks and bounce suppression work.
  - Area: Email. Depends on: N01.

- [ ] **N03 — Build inbox and preferences**
  - Done when: Unread/read state, visible-page polling, timezone, offsets and separate email opt-in work.
  - Area: Notifications. Depends on: N01.

- [ ] **N04 — Implement deadline-aware reminders**
  - Done when: Unique logical sends; current deadline/version/status rechecked; old pending reminders cancelled after corrections.
  - Area: Notifications. Depends on: N02;N03.

- [ ] **N05 — Handle downtime and quotas**
  - Done when: Missed reminders consolidated; ambiguous sends reviewed; authentication capacity reserved; quota delays visible.
  - Area: Notifications. Depends on: N04.

- [ ] **O01 — Add health and error monitoring**
  - Done when: Uptime, worker heartbeat, queue age, disk and rotated sanitized logs monitored; synthetic failure triggers an alert.
  - Area: Operations. Depends on: F06;N01.

- [ ] **O02 — Automate encrypted off-server backups**
  - Done when: Daily consistent DB backup plus key/config recovery material; retention and stale-backup alert configured.
  - Area: Operations. Depends on: F08;C02.

- [ ] **O03 — Test full restoration**
  - Done when: Restore isolated database/config/keys with mail disabled; ownership verified; recovery time and data-loss window recorded.
  - Area: Operations. Depends on: O02.

- [ ] **O04 — Implement export and account deletion**
  - Done when: User can export/delete data; retention and restore tombstones prevent deleted accounts silently returning.
  - Area: Privacy. Depends on: A08;O03.

- [ ] **O05 — Publish privacy and support pages**
  - Done when: Data use, independent-provider role, correction process, scope and support contact are clear.
  - Area: Product. Depends on: O04.

- [ ] **O06 — Run security regression checks**
  - Done when: CSRF, reset token misuse, cross-user access, editor boundaries, request caps and safe imports verified.
  - Area: Testing. Depends on: N05;O04.

- [ ] **O07 — Run responsive and accessibility checks**
  - Done when: Chromium/Firefox/WebKit, keyboard, touch, 200/400% zoom, landscape and long-text states verified.
  - Area: Testing. Depends on: A08;N03.

- [ ] **O08 — Test launch load and queue recovery**
  - Done when: Isolated 50-user/15-minute workload plus 500 mock reminders; target p95 <700ms and <1% errors; no lost logical records.
  - Area: Performance. Depends on: N05;O01.

- [ ] **O09 — Finish production runbook**
  - Done when: Migrations, rollback, certificate renewal, secret handling, DB pools, resource limits and patch/restore steps documented.
  - Area: Deployment. Depends on: O03;O06;O08.

- [ ] **O10 — Observe 5–10 testers**
  - Done when: Five complete onboarding/save; target three returning users; confusing steps and critical data errors fixed.
  - Area: Pilot. Depends on: O05;O07;O09.

- [ ] **O11 — Release V1**
  - Done when: All V1 required rows accepted; no unsourced critical claims; demo, imports, matching, tracking, reminders and restore demonstrated.
  - Area: Release gate. Depends on: O10.

## V2 — 10 tracking items

### Automated discovery and monitoring (Phase 4)

- [ ] **S01 — Approve listing-page discovery rules**
  - Done when: Allowed listing paths, request/page caps and candidate URL rules recorded.
  - Area: Discovery. Depends on: O11.

- [ ] **S02 — Discover and deduplicate candidate URLs**
  - Done when: Bounded scan creates candidates; canonical URL and cycle identity prevent duplicates; uncertain matches reviewed.
  - Area: Discovery. Depends on: S01.

- [ ] **S03 — Schedule source rechecks**
  - Done when: Permitted frequencies and source enable/disable controls work; manual import remains available.
  - Area: Imports. Depends on: S02.

- [ ] **S04 — Review changed fields before publication**
  - Done when: Hashes/field diffs show changes; disappearing dates do not delete facts; published corrections trigger approved updates only.
  - Area: Admin. Depends on: S03.

- [ ] **S05 — Add selected public PDF extraction**
  - Done when: Bounded text-PDF extraction retains page evidence; unsupported/scanned documents route to manual entry.
  - Area: Imports. Depends on: S04.

- [ ] **S06 — Expand to 3–5 reliable integrations**
  - Done when: Each adapter has fixtures, health tracking and manual fallback; breadth limited by review capacity.
  - Area: Imports. Depends on: S05.

- [ ] **S07 — Add source-health and freshness queue**
  - Done when: Broken/stale sources and changed deadlines visible; saved-application sources can be prioritized.
  - Area: Admin. Depends on: S04.

- [ ] **S08 — Accept moderated applicant link suggestions**
  - Done when: Suggestions queue for editor review; arbitrary applicant links are not fetched immediately.
  - Area: Discovery. Depends on: S01.

- [ ] **S09 — Verify scheduled collection safety**
  - Done when: Duplicate scans, expired cycles, rate limits and source failure tested; reminders remain responsive.
  - Area: Testing. Depends on: S06;S07;S08.

- [ ] **S10 — Release V2**
  - Done when: Discovery/rechecks produce reviewed candidates and corrections; V1 journeys remain functional.
  - Area: Release gate. Depends on: S09.

## V3 — 12 tracking items

### Documents and optional intelligence (Phase 5)

- [ ] **U01 — Set up private storage and quotas**
  - Done when: Private buckets, short-lived access, opaque keys and size/count quotas configured; public access denied.
  - Area: Documents. Depends on: S10.

- [ ] **U02 — Quarantine and scan uploads**
  - Done when: File signature/size validation and malware scan precede access; parser limits and failed-scan quarantine verified.
  - Area: Security. Depends on: U01.

- [ ] **U03 — Add document versions and task links**
  - Done when: CV/transcript/MOI versions link to correct owner and task; replacement does not silently change old links.
  - Area: Documents. Depends on: U02.

- [ ] **U04 — Implement file deletion and recovery**
  - Done when: Orphans/quarantine cleaned; retention enforced; encrypted backup/restore covers files and metadata.
  - Area: Privacy. Depends on: U03.

- [ ] **U05 — Verify document isolation**
  - Done when: Cross-user downloads, disguised files, expired links, oversized inputs and interrupted uploads tested.
  - Area: Testing. Depends on: U04.

- [ ] **I01 — Decide whether to enable paid AI** — Optional
  - Done when: Evaluation purpose, account access, consent and hard spend limits approved; may remain disabled.
  - Area: AI decision. Depends on: U05.

- [ ] **I02 — Extract scholarship field suggestions** — Optional
  - Done when: Structured validated proposals have evidence; missing/old/conflicting facts flagged; editor approval mandatory.
  - Area: AI. Depends on: I01.

- [ ] **I03 — Suggest profile fields from CV** — Optional
  - Done when: User explicitly consents and accepts individual changes; no silent overwrite or cross-user access.
  - Area: AI. Depends on: I02;U03.

- [ ] **I04 — Answer questions using reviewed evidence** — Optional
  - Done when: Answers link to verified sources and admit unknowns; no essay generation or submission automation.
  - Area: AI. Depends on: I02.

- [ ] **I05 — Evaluate AI accuracy and failure modes** — Optional
  - Done when: At least 30 labelled examples; injection/schema/year/evidence cases checked; cost cutoff and disabled-provider fallback work.
  - Area: Testing. Depends on: I03;I04.

- [ ] **U06 — Release V3 document features**
  - Done when: Private document flow and recovery pass; optional AI is either validated or explicitly left disabled.
  - Area: Release gate. Depends on: U05.

- [ ] **I06 — Enable optional V3 AI features** — Optional
  - Done when: I01–I05 completed and reviewed; core product still works with AI disabled.
  - Area: Release gate. Depends on: I05;U06.

## V4 — 10 tracking items

### Selective expansion backlog (Phase 6)

- [ ] **X01 — Add Amharic interface** — Optional
  - Done when: Demand established; translated strings, fonts, long-text layouts and date meaning verified.
  - Area: Localization. Depends on: U06.

- [ ] **X02 — Add opt-in Telegram alerts** — Optional
  - Done when: Demand established; short-lived account linking, opt-out and privacy tests pass.
  - Area: Notifications. Depends on: U06.

- [ ] **X03 — Support selected application portals** — Optional
  - Done when: One explicitly supported portal tested; user reviews fields; no CAPTCHA bypass or automatic submission.
  - Area: Autofill. Depends on: U06.

- [ ] **X04 — Improve public opportunity SEO** — Optional
  - Done when: Demand established; only published public data indexed; private app routes excluded.
  - Area: Discovery. Depends on: U06.

- [ ] **X05 — Add partner editors** — Optional
  - Done when: Scoped permissions and audit trail tested; publication control remains explicit.
  - Area: Admin. Depends on: U06.

- [ ] **X06 — Expand nationalities or degree levels** — Optional
  - Done when: New audience validated; source coverage and rules reviewed rather than inferred from Ethiopian eligibility.
  - Area: Audience. Depends on: U06.

- [ ] **X07 — Optimize only measured bottlenecks** — Optional
  - Done when: Query plans and telemetry justify indexes/cache/precomputation; private data never publicly cached.
  - Area: Performance. Depends on: O11.

- [ ] **X08 — Scale workers or API capacity** — Optional
  - Done when: Measured queue/CPU/RAM issue; shared keys, scheduler coordination and global limits tested before replicas.
  - Area: Infrastructure. Depends on: X07.

- [ ] **X09 — Improve disaster recovery or add a second host** — Optional
  - Done when: Recovery objective justifies cost; WAL/file restore and failover actually tested.
  - Area: Infrastructure. Depends on: O03.

- [ ] **X10 — Approve each selected V4 increment** — Optional
  - Done when: Only chosen features are release requirements; regression, operating cost and support impact accepted.
  - Area: Release gate. Depends on: U06.

## Recurring maintenance after V1

These are recurring responsibilities, not one-time release features. Add repeating Notion tasks after launch if useful.

- [ ] During open cycles: triage urgent deadline/source reports and check flagged changes.
- [ ] Weekly: review stale listings, broken adapters, failed deliveries, quota usage and backup status.
- [ ] Monthly: patch dependencies/OS, review disk/log usage, and perform an isolated restore drill.
- [ ] Each release: run critical journey/security checks, confirm migration compatibility and document rollback.

## Explicitly outside the launch scope

Universal scraping, automatic submissions, paid AI/SMS, applicant file uploads, essay generation, native mobile apps, Kubernetes and payment collection are not V1 requirements. Source URLs still need to be found by the maintainer in V1; the importer reduces data entry but does not automatically discover the web.
