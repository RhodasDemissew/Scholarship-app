# Scholarship Application Assistant for Ethiopian Master's Applicants

Implementation blueprint • Version 1.2 • Updated 20 October 2026

Revision: V1 now includes admin-assisted URL importing from 2–3 approved sources, mandatory review and manual entry fallback. React, Contabo VPS, Nginx, fluid responsive layouts and the free-first operating plan remain the foundation. V1 means Phases 0–3; automated discovery and scheduled change monitoring remain Phase 4.

## 1. Product decision

Build a fully responsive web application for phones, tablets, laptops and large desktop displays that helps Ethiopian master's applicants discover relevant funding, understand published requirements, and complete preparation in the correct order.

The core promise is: **Enter your background once, understand which opportunities fit, and see exactly what to do next.**

The product is an independent preparation tool. Universities and scholarship providers remain the authorities on eligibility and admissions. The first release does not submit applications, collect application fees, generate admissions probabilities, or promise comprehensive worldwide coverage.

### Intended users

- Ethiopian citizens living in Ethiopia or abroad, with residence recorded separately from nationality.
- Bachelor's graduates and final-year students, where a programme permits them.
- Applicants seeking master's-level funding, including full and partial awards.
- Initially English-language listings and interface, with an Amharic interface introduced after the core flow is validated.

### First complete user journey

1. Explore a labelled demo without creating an account.
2. Register and verify an email address.
3. Enter a short profile, then optionally add details that improve matching.
4. Browse verified application cycles and inspect requirement-by-requirement explanations.
5. Save an opportunity and start an application plan.
6. Complete document and preparation tasks, track references, and record progress.
7. Receive in-app and email reminders.
8. Open the official application website and submit there.
9. Mark the submission and eventual outcome manually.

### What success means

Users can identify relevant opportunities, explain why a requirement is unresolved, and find their next action without asking the developer. Measure time saved against their previous process; do not invent a percentage before testing.

Pilot targets, not market forecasts: five testers complete onboarding and save an opportunity; at least three return to update a task; no known unsourced critical eligibility or deadline claims remain published. Demonstration must work with fictional profiles even before recruitment.

## 2. Technology decisions

Use React for the frontend, ASP.NET Core for the backend, and a Contabo VPS running Nginx. Start a clean repository. The supplied project manifests show React and .NET experience, but this plan now follows the explicit React preference. No application code has been migrated or deployed by this document update.

| Area | Chosen technology | When and why |
| --- | --- | --- |
| Frontend | React 19.x + TypeScript, built with Vite | Phase 0; functional components and hooks; pin supported compatible patches during scaffold |
| Build runtime | Node.js 22 LTS + npm lockfile | Build/CI only; no Node server needed to serve the production SPA |
| Routing | React Router 7 in SPA/library mode | Client routes, nested layouts and lazy-loaded features |
| UI | Tailwind CSS 4 + shadcn/ui free components | Responsive styling and accessible primitives; no paid templates or component packs |
| Local state | useState/useReducer; Context for small shared concerns | Avoid global stores until the need is demonstrated |
| API/server state | TanStack Query 5 + Fetch API | Request caching, stale data, retries and mutations; clear private caches on logout |
| Forms | React Hook Form + Zod | Profile wizard and admin forms; backend still validates independently |
| Backend | ASP.NET Core 10 Web API, C# | Current supported .NET 10 LTS patch [S2] |
| Database access | EF Core 10 + Npgsql EF provider 10 | Matching major versions [S3] |
| Database | PostgreSQL 17 in Docker, persistent volume | Free software; local and VPS use the same patched major |
| Authentication | ASP.NET Core Identity + secure cookie sessions | Same-origin React/API app; no JWT in localStorage |
| API description/client | ASP.NET Core OpenAPI + openapi-typescript/openapi-fetch | Generated TypeScript contracts, wrapped by TanStack Query hooks |
| Scheduling | Quartz.NET 4.x with PostgreSQL persistence | Phase 1 for durable import jobs; Phase 3 adds reminders; separate worker container on the same VPS [S4] |
| Reliable external actions | Transactional outbox in PostgreSQL | Durable emails and reminders with retries and deduplication |
| Email | Resend free tier; Mailpit locally | Verified domain; enforce daily/monthly quotas [S7] |
| In-app notifications | Database inbox; poll every 60 seconds while visible | No paid notification platform or sockets initially |
| File storage | No applicant uploads in V1; private R2 later | V1 tracks document readiness only; R2 free allowance is capped [S8] |
| HTML/PDF extraction | HttpClient + AngleSharp + PdfPig | Phase 1: HttpClient + AngleSharp for 2–3 approved static HTML sources; PdfPig for selected public PDFs in Phase 4 |
| Browser extraction | Playwright .NET in a restricted worker | Only later for a source that needs it; adds memory requirements |
| AI | Optional OpenAI structured extraction | Phase 5 only; V1 has no AI cost or dependency [S13] |
| Hosting | One Contabo VPS; Ubuntu Server 24.04 LTS | Proposed starting size: 4 shared vCPU, 8 GB RAM; validate actual checkout [S6] |
| Web server | Nginx Open Source on the host | Static React files, TLS termination and reverse proxy to ASP.NET [S5] |
| HTTPS | Let's Encrypt + Certbot | Free certificates; automatic renewal and expiry monitoring [S22] |
| DNS | Cloudflare Free DNS, initially DNS-only | Domain registration still costs money |
| Containers | Docker Engine + Compose plugin on Linux | API, worker and PostgreSQL; no paid hosting panel |
| CI/CD | GitHub Actions within allowance; local build/deploy fallback | Publish immutable images and a React dist artifact; cap minutes/storage |
| Registry | GHCR within account allowance | Confirm private-image storage/transfer terms before relying on zero cost |
| Monitoring | Rotated JSON logs, health checks, free external uptime tier | Optional Sentry free allowance with PII scrubbing; no paid observability in V1 |
| Backups | pg_dump + encrypted off-server transfer using restic/rclone | Schedule with systemd timer; restoration tested before pilot [S15] |
| Backend tests | xUnit + WebApplicationFactory + Testcontainers PostgreSQL | Real database integration tests |
| Frontend tests | Vitest + React Testing Library; Playwright E2E | User-facing behavior and critical journeys |
| Accessibility | axe-core + manual keyboard/zoom checks | Responsive layout and meaningful errors |
| Load testing | k6 | Synthetic staging tests, mocked provider sends |
| Search | PostgreSQL filters/full-text search | No paid search service |
| Cache later | Valkey, if measured demand warrants it | Free Redis-compatible software; consumes server resources |
| Analytics | Minimal first-party aggregate events | Avoid extra paid tools and private document capture |

Resolve compatible supported patches during scaffolding and commit package-lock.json, global.json and central NuGet versions. React's official documentation describes a Vite-based setup but notes that routing and data fetching require choices [S1]. Those choices are fixed above. React and ASP.NET are separate layers; changing the frontend does not require changing the backend or database.

### React versus Angular for this project

| Topic | Angular | React choice here |
| --- | --- | --- |
| Structure | Integrated framework with routing, forms and dependency injection | UI library with explicitly chosen routing/form/data libraries |
| Components | Templates, framework conventions and services | TSX/JSX, function components, props and hooks |
| Forms | First-party forms system, useful for large structured forms | React Hook Form + Zod supplies a consistent form approach |
| Shared logic | Built-in dependency injection and services | Hooks, modules, Context and explicit function dependencies |
| Main advantage | Consistent conventions and fewer integration decisions | Flexible composition and component selection |
| Main tradeoff | More framework concepts and conventions to learn | You must maintain consistent library choices and patterns |
| Your transition | Existing experience makes it familiar | Learn hooks, render behavior, effects, query caching and TSX |

Both can implement this product and responsive designs. Neither guarantees faster pages or better accessibility by itself. Your TypeScript, component design, validation and API knowledge transfer. Reserve a small React learning spike for forms, protected routes, CSRF and fetching before estimating velocity. Angular's integrated features are documented in [S23].

### Free-first V1 policy

Phases 0–3 use open-source software and capped free service tiers wherever practical. The VPS and a domain are the expected recurring/annual purchases. Off-server backup storage may add a small cost if its free allowance is insufficient. Do not self-host public SMTP merely to avoid email-provider costs: use a transactional provider free tier and visible quota handling.

No paid AI, SMS, managed database, managed app workers, premium UI template, Kubernetes or paid control panel is required in V1. Optional services must degrade gracefully at quota limits; core data must not expire when a free trial ends. Confirm billing/account access from Ethiopia before purchasing a VPS/domain.

## 3. Architecture and repository

Use a **modular monolith**: one backend codebase with clear feature boundaries, deployed as a web process and a worker process. Both use the same database. This supports separate worker scaling without microservices.

### Deployment topology

| Component | Responsibility | Connectivity |
| --- | --- | --- |
| Browser | React application at one origin | HTTPS to Nginx |
| Host Nginx | Serve React dist; terminate TLS; proxy API/health | Public 80/443; API upstream on 127.0.0.1:8080 |
| API container | /api/v1 endpoints, Identity and authorization | Publish 127.0.0.1:8080:8080 only; private Docker DB network |
| Worker container | Approved-source imports from Phase 1; outbox and reminder scans from Phase 3 | No published port; private DB network and bounded outbound requests |
| PostgreSQL container | Data, scheduler, keyring and audit | Persistent volume; no public or host-published 5432 port |
| Resend | Email delivery/webhooks | Outbound HTTPS; signed webhook through Nginx/API |
| Off-server backup target | Encrypted DB/key/config backups | Scheduled outbound transfer; credentials separate from application |
| R2 later | Private documents and versioned objects | Introduced with Phase 5 permissions/scanning |

Build React using Vite in CI or locally, then deploy its dist directory to a versioned release directory on the VPS. Nginx serves that directory and sends `/api/` and `/health/` to the API. ASP.NET no longer serves the frontend assets. No production Vite dev server is exposed.

Keep API, health and webhook requests out of the SPA fallback. Unknown client routes fall back to index.html; missing assets return 404. Hashed assets have long immutable caching; index.html revalidates. Personal API responses and document links use `Cache-Control: no-store` and must not be proxy-cached.

Same origin simplifies authentication. Configure a Vite development proxy for `/api`. A shared Fetch wrapper sends credentials and the antiforgery header on unsafe methods. React provides no automatic Angular-style XSRF interceptor; implement and test this explicitly.

### Repository map

| Path | Contents |
| --- | --- |
| apps/web/ | React shell, shared UI, route features, query hooks and generated API client |
| src/Scholarship.Api/ | Controllers, authentication, authorization, request validation, OpenAPI |
| src/Scholarship.Core/ | Entities, rule evaluation, application workflow and domain services |
| src/Scholarship.Infrastructure/ | EF Core, email, storage, extraction and external provider adapters |
| src/Scholarship.Worker/ | Quartz jobs, outbox dispatch and source processing |
| tests/Unit/ | Matching logic, deadlines, workflow and deduplication |
| tests/Integration/ | Database/API/authorization tests |
| tests/E2E/ | Browser flows and accessibility |
| tests/Load/ | k6 scenarios |
| data/fixtures/ | Fictional profiles and labelled demonstration opportunities |
| infra/ | Dockerfiles, Compose files, Nginx configuration, backup timers and deployment scripts |
| docs/ | Decisions, data dictionary, source register, support and recovery runbooks |

Feature modules: Identity, Profiles, Catalogue, Matching, Applications, Notifications, Sources, Documents and Administration. Use normal dependency injection and EF Core directly in infrastructure services. Do not add generic repository layers, a service bus, Kubernetes or multiple backend languages to the first release.

## 4. Phased rollout and effort

Effort is an engineering estimate, not a delivery guarantee. It assumes one developer comfortable with .NET and able to learn/use React, modest design scope, and a small curated catalogue. Provider onboarding, source research and unfamiliar infrastructure can add time. The earlier 6–10-week discussion was a rough estimate for a smaller scope; this plan explicitly budgets reliability and operations.

| Phase | Outcome | Estimated focused hours | Release gate |
| --- | --- | --- | --- |
| 0 — Foundation | Working repository, thin vertical slice and staging | 12–20 | UI reads one DB-backed listing from deployed API |
| 1 — Trusted catalogue and assisted imports | Accounts, editorial tools, 2–3 source adapters and verified opportunities | 59–90 | Import/review/publish and manual fallback work; applicant can browse/save |
| 2 — Personal application assistant | Profile, explainable matching and task tracking | 45–65 | User completes profile-to-application flow |
| 3 — Reliable pilot | Reminders, backups, observability and pilot feedback | 30–45 | Security, recovery, notification and load gates pass |
| 4 — Automated discovery and monitoring | Selected listing-page discovery, scheduled rechecks, more adapters and PDF support | 30–50 | Discovery creates candidates; changed facts require review |
| 5 — Reuse and intelligence | Private documents, profile import and optional AI | 45–75 | User confirmation, isolation and extraction evaluation pass |
| 6 — Expansion | Additional sources, channels and capacity | Driven by evidence | A measured product or performance problem justifies each addition |

Base feature effort for Phases 0–3 is **146–220 focused hours**, including an additional **24–40 hours** for a bounded importer. Add **16–32 hours** for React onboarding and self-managed VPS setup: revised V1 total **162–252 hours**, about **9–17 weeks at 15–20 hours/week**. Through Phase 5, the corresponding planning range is **237–377 hours**, approximately **12–26 weeks at that pace**. These ranges assume 2–3 simple static HTML sources; difficult sites require more time or manual fallback. Reserve recurring time for finding pages and verifying listings; importing does not remove that work.

### Phase 0 — Foundation

1. Create a clean private Git repository, branch protection and a task board.
2. Record this scope and six architecture decisions: framework versions, same-origin hosting, PostgreSQL, cookie auth, editorial publication, and no auto-submission.
3. Scaffold React/Vite/TypeScript and ASP.NET Core; add Core and Infrastructure projects and an initially minimal Worker project.
4. Configure formatting, analyzers, secret scanning, dependency checks and CI builds.
5. Start PostgreSQL and Mailpit with Docker Compose.
6. Add an OpportunityCycle table and one fictional fixture through a migration/seed command.
7. Implement GET /api/v1/opportunities and a simple React listing screen.
8. Generate a typed API client from OpenAPI; verify enum/null/date handling.
9. Build the API image and React assets; deploy an isolated staging Compose project behind Nginx using synthetic data.
10. Test a browser request, database read, health check and rollback to the prior image.

Done when a deployed page displays a real database record and a new developer can run the app from README instructions. This is the first coding objective; scraping is not.

### Phase 1 — Trusted catalogue, accounts and assisted imports

1. Add Identity, email verification, login/logout, reset password, rate limits and admin MFA.
2. Create profile shell and personal save list. Profile fields can remain incomplete.
3. Implement institution, programme, funding award, cycle, deadline, requirement and evidence records.
4. Build a structured admin form; do not build a generic visual rules editor yet.
5. Add review, publish, correction and archive actions with audit records.
6. Manually verify three opportunities to establish the data model, then implement the V1 importer in section 10. Support 2–3 approved static HTML sources and preserve manual entry for all other sources.
7. Import and review enough records to reach 10 verified opportunities first; expand to 20–30 only if verification is manageable. Each is an actual programme/funding combination for a specified intake, not a broad scholarship brand.
8. Build browsing, filters, detail page, source links, funding breakdown and last-checked labels.
9. Add report-an-error and save/unsave actions.
10. Create a read-only public demo using clearly fictional or separately sourced records.

Done when every published eligibility/deadline/funding claim has supporting evidence or an explicit unknown state, 2–3 supported-source imports produce reviewable drafts, and unsupported or broken sources have a working manual fallback. Repeat imports must not duplicate cycles; worker restart must not lose an accepted import. No publication without review. Opening status is not inferred from a future deadline alone.

### Phase 2 — Profile, matching and applications

1. Build progressive profile forms: essentials first, optional eligibility details later.
2. Implement typed rule evaluation with four outcomes and logical AND/OR groups.
3. Add a programme match page showing reasons, missing facts and evidence.
4. Add preference sorting separately from eligibility; no admissions probability.
5. Add application creation from a versioned task template.
6. Track admission and scholarship processes separately where needed.
7. Add task dependencies, due dates, reference tracking and reusable text fields.
8. Add application dashboard, status transitions and calendar export.
9. Provide an explicit re-evaluation action after profile/rule updates, and mark stale match results.
10. Test three fictional profiles and programmes with different nationality, English evidence and experience rules.

Done when one user can go from onboarding to an application plan with a clear next action, and a second user cannot see or alter any of the first user's private records.

### Phase 3 — Pilot, notifications and operations

1. Extend the Phase 1 worker and persistent Quartz setup with notification jobs; keep imports bounded so they cannot starve reminders.
2. Implement the outbox, provider idempotency, bounded retries and failed-message review.
3. Add user-configurable reminder offsets, a notification inbox and email preferences.
4. Implement signed email webhook processing and bounce/complaint suppression.
5. Configure structured logs, free external uptime checks, queue heartbeat and alerts; enable Sentry only within its free allowance if useful.
6. Configure DB backups, encrypted key backups and a tested restore procedure.
7. Add deletion/export workflows and clear privacy/support pages.
8. Run authorization, CSRF, email-retry, downtime recovery and load tests.
9. Invite 5–10 testers; observe onboarding instead of only asking whether they like it.
10. Fix confusing steps and data errors before increasing the catalogue.

Done when reminders recover after worker downtime, an actual backup has been restored in an isolated environment, and the pilot quality gates in section 14 pass. This is the first full public-release candidate.

### Phase 4 — Automated discovery and source monitoring

1. Extend the V1 source register with explicitly approved listing pages and discovery rules.
2. Scan selected listing pages for candidate links with page/request caps; do not crawl arbitrary linked sites.
3. Deduplicate candidates by canonical URL and programme/award/intake/round; send ambiguous identities for review.
4. Schedule bounded rechecks of tracked current cycles and compare content hashes and parsed fields.
5. Reuse the V1 proposal/diff screen; require approval before changing published facts or notifying applicants.
6. Add further static adapters and selected text-PDF extraction with regression fixtures.
7. Add applicant link suggestions as a moderation queue; never fetch arbitrary applicant URLs immediately.
8. Add source-health trends and urgent editorial alerts for changed deadlines or broken pages.

Done when discovery produces reviewable candidates, repeated scans do not duplicate records, old pages do not reopen cycles, and corrections notify applicants only after approval. Aim for 3–5 reliable integrations before increasing breadth. Browser extraction remains optional, not a prerequisite.

### Phase 5 — Documents and controlled AI

1. Add private upload initiation, quarantine, scanning, completion and authorized download.
2. Store versions of CVs, transcripts and MOI letters; skip passport uploads initially.
3. Attach the correct document version to each checklist item without submitting it externally.
4. Extract CV profile suggestions and let the user accept each proposed field.
5. Add structured scholarship extraction to reduce admin data entry.
6. Add programme Q&A over reviewed evidence, with source links and an unknown answer when unsupported.
7. Evaluate against human-labelled examples and cap per-user/provider spending.
8. Add explicit AI consent for personal documents and purge workflows.

Done when disabling AI leaves all core flows functional, a malicious document cannot execute instructions or access other users' data, and critical extraction fields pass review. Do not launch an essay generator as part of this phase.

### Phase 6 — Selective expansion

Choose additions based on measured demand: Amharic UI, Telegram opt-in alerts, selected portal autofill, public opportunity SEO, partner editors, more countries, shared caching, multiple web replicas and larger worker pools. Each should have a separate acceptance criterion and cost estimate. No automatic expansion into payments or universal application submission.

## 5. Screens and interaction requirements

| Screen | Required content |
| --- | --- |
| Landing/demo | Product purpose, scope, fictional demo, official-provider disclaimer |
| Registration/security | Email verification, password reset, session management |
| Onboarding/profile | Nationality, residence, education, original grading scale, English evidence, interests |
| Opportunity explorer | Filters, funding coverage, cycle status, last verification, saves |
| Opportunity detail | Programme and award, eligibility, deadlines, evidence, official application links |
| My matches | Requirement results, uncertainty, missing profile fields, preference ordering |
| Application dashboard | Tracked applications, next task, approaching deadlines |
| Application workspace | Admission/funding tracks, dependencies, tasks, references, notes |
| Notifications/settings | Unread notices, email opt-in, quiet hours, timezone, deletion/export |
| Admin catalogue | Drafts, reviews, publish/correct/archive, source evidence |
| Admin imports — V1 | Approved URL input, supported-source list, job status, field evidence/diff, accept/reject and manual fallback |
| Admin operations | Stale records, broken sources, failed jobs, email failures, user error reports |
| Documents — later | Private files, versions, scan status and linked checklist items |

### Responsive acceptance criteria

“All pixels” means fluid behavior between breakpoints, not a fixed layout for every physical screen resolution. Design in CSS pixels and test reflow continuously. Support at least 320 CSS px through ultrawide desktops, both orientations, touch and keyboard. Below the supported minimum, preserve readable content with graceful overflow rather than claiming universal pixel perfection.

- Use flexible Grid/Flexbox, fluid widths, minmax(), clamp() and a sensible maximum content width. Avoid fixed page widths/heights and absolute positioning for normal content.
- Suggested content-driven breakpoints: 640, 768, 1024, 1280 and 1536 CSS px. Breakpoints are starting points, not separate pages.
- Small screens: single-column forms, collapsible navigation, filters in an accessible drawer, and cards for application lists.
- Medium screens: two-column catalogue where content fits; wide forms remain comfortably readable.
- Desktop: persistent sidebar and multi-column dashboards; constrain long text instead of stretching it across the screen.
- Admin tables use an explicitly labelled local scroll region or column prioritization; the whole page must not scroll horizontally.
- Test at widths 320, 360, 390, 640, 768, 1024, 1280, 1440, 1920 and 2560, and resize between them. Include short landscape heights and open mobile keyboard behavior.
- Test 200% zoom and reflow at 400% on a desktop viewport equivalent to approximately 320 CSS px. No clipped controls, overlapping text or inaccessible buttons.
- Verify long scholarship titles, long URLs, validation messages, empty/loading/error states and later Amharic text. Images preserve aspect ratio; support reduced motion.
- Use practical touch targets around 44 CSS px where possible, visible focus, text labels and accessible contrast. Do not express eligibility through color alone.
- Test Chromium, Firefox and WebKit in Playwright, plus actual Android Chrome and iOS Safari when devices are available. Check representative laptop and desktop sizes too.

Show saving, saved and failed states. Retain unsaved form state during transient errors in the active session, but do not persist sensitive data to localStorage by default. Responsive testing is a release gate from Phase 1, not a later enhancement.

Use English initially and externalize UI strings from the start. Store canonical timestamps and timezone information; Ethiopian-calendar display can be optional later and must never alter the original deadline interpretation. Format dates explicitly, e.g. “15 December 2026, 23:59 — Europe/Paris”, with an Addis Ababa conversion only if the official time and zone are known.

## 6. Database design

Use UUID identifiers, UTC timestamps, explicit status enums, foreign keys and optimistic concurrency. The table list is a roadmap: migrate each group only when its phase begins.

| Entity | Important fields and relationships | Phase |
| --- | --- | --- |
| IdentityUsers / Roles | Identity-managed auth fields; Applicant, Editor, Administrator roles | 1 |
| ApplicantProfiles | UserId unique, residence, graduation status, preferences, ProfileVersion | 2 |
| ApplicantNationalities | ProfileId, ISO country code; supports multiple nationalities | 2 |
| EducationRecords | Institution, country, qualification, subject, dates, GPA value AND grading scale | 2 |
| ExperienceRecords | Employment/volunteer type, dates, hours if needed; no unqualified duration assumptions | 2 |
| EnglishEvidence | Type, test scores/subscores, test date, MOI status | 2 |
| Institutions | Name, official domain, country | 1 |
| Programmes | InstitutionId, title, degree level, subjects, delivery mode, official URL | 1 |
| FundingAwards | Sponsor, name, official URL | 1 |
| OpportunityCycles | ProgrammeId, FundingAwardId nullable, intake, cycle key, PublicationStatus, ApplicationStatus, version | 1 |
| FundingComponents | CycleId, component, Covered/NotCovered/Unknown, amount/currency/conditions | 1 |
| Deadlines | CycleId, kind, original text, local date/time, IANA zone, InstantUtc nullable, precision, version | 1 |
| RequirementGroups | CycleId, parent group, ALL/ANY operator | 2 |
| Requirements | GroupId, scope, predicate type, parameters JSONB, hard/conditional, evidence, version | 1–2 |
| Sources / SourceDocuments | Official URL, domain, fetched/reviewed dates, hash, access notes, evidence text | 1 |
| FieldEvidence | Entity/field reference, SourceDocumentId, excerpt/page/selector, reviewer, verification state | 1 |
| SavedOpportunities | UserId + CycleId unique | 1 |
| MatchEvaluations | UserId, CycleId, ProfileVersion, RuleVersion, per-rule outcomes, evaluated timestamp | 2 |
| Applications | UserId, CycleId, track, status, template version, submitted time; unique per user/cycle/track | 2 |
| TaskTemplates / TemplateDependencies | Versioned steps, dependency edges and relative due-date policy | 2 |
| ApplicationTasks / TaskDependencies | ApplicationId, copied instructions, status, due date, evidence references | 2 |
| RefereeContacts / ApplicationReferees | User ownership, name/email, requested/received/self-reported status | 2 |
| UserPreferences | Reminder offsets, channels, timezone, consent versions | 3 |
| Notifications | UserId, event type, read time, safe app link, unique event key | 3 |
| OutboxMessages | EventId, payload, status, attempts, next-attempt time, lease owner/expiry, provider id | 3 |
| NotificationDeliveries | Logical notification + channel unique, provider id, accepted/delivered/failed state | 3 |
| Quartz tables | Separate scheduler schema, installed from matching version's official migration scripts | 1 |
| DataProtectionKeys | Persisted shared ASP.NET keys, encrypted with separately stored certificate | 1 |
| AuditEvents | Actor, action, record ID, version, safe field diff, timestamp | 1 |
| SourceFetchRuns / ExtractionProposals | SourceId, canonical URL, intake candidate, parser version, status, attempts, lease, hash, draft values/evidence, reviewer and decision | 1 |
| Documents / DocumentVersions | UserId, opaque object key, MIME, bytes, hash, scan state, retention | 5 |
| ApplicationDocuments | TaskId + DocumentVersionId, owner consistency enforced | 5 |
| AiRuns | Purpose, model/config version, input hash, token/cost usage, result state | 5 |

Separate scholarship funding from programme admission. A programme may have several awards and each year's cycle may have different rules. “Mastercard Foundation” alone is not a complete application record. Partners manage their own processes [S17]. Erasmus Mundus similarly directs applicants to programme-specific websites [S16].

### Constraints and indexes

- Unique cycle key based on programme + award (including an explicit no-award case) + intake + round. Handle nullable award IDs explicitly in PostgreSQL uniqueness rules.
- Unique saves, logical reminder keys, external webhook event IDs and import source/cycle identities.
- Index application/task ownership lookups, published cycle status/intake, deadlines, and outbox `(Status, NextAttemptAt)`.
- Use row-version/concurrency tokens for editor changes; return HTTP 409 for stale updates.
- Use relational fields for frequently filtered data. JSONB is appropriate for typed rule parameters and extraction proposals, not as a substitute for all relationships.
- Preserve task history and completed work when a template changes. Propose a diff; do not regenerate the application destructively.

## 7. Eligibility and matching specification

### Rule model

Each rule carries a scope (admission, scholarship, procedural), a typed predicate, typed values, an evidence reference and a version. Support a small explicit predicate registry: CountryInList, DegreeLevel, SubjectInList, GraduationByDate, MinimumExperience, TestScore, AgeAtDate and ManualAssessmentRequired. Add predicates only for real source requirements.

An example below is fictional and illustrates the storage contract, not an actual award:

```json
{
  "scope": "scholarship",
  "predicate": "CountryInList",
  "field": "nationalities",
  "parameters": { "countries": ["ET"], "mode": "any" },
  "evidenceId": "sample-evidence-id",
  "version": 1
}
```

Never execute source-supplied expressions or AI-generated code. Rules are data passed to known evaluators. Represent exceptions with ALL/ANY groups and explicit conditional branches; unsupported wording becomes NeedsConfirmation.

### Four outcomes

| Outcome | Meaning |
| --- | --- |
| MeetsPublishedRule | Applicant data and reviewed rule allow a clear pass |
| DoesNotMeetPublishedRule | Clear contradiction with an applicable requirement |
| NeedsConfirmation | Rule interpretation, equivalence or exception needs external judgment |
| MissingApplicantInformation | Required applicant input is absent |

For ALL groups: a definitive failure dominates; otherwise retain unresolved states until all required children pass. For ANY groups: one valid pass satisfies the group; fail only if all branches definitively fail. If unresolved branches remain, do not declare failure or full eligibility. Preserve child explanations.

Top-level label should say “No unmet published requirements found” rather than “Guaranteed eligible”. Any unresolved mandatory item prevents the fully checked label. Always show missing coverage: the app may not encode every admissions judgment.

### Important edge cases

- Citizenship and residence may both matter; one cannot substitute for the other.
- Record GPA with its original scale. Do not map 3.5/4.0 to a UK degree classification without an institution-approved rule.
- Record institution/degree equivalence as unresolved when the source leaves it to admissions.
- MOI acceptance is specific to a programme and sometimes qualification country/date.
- Count experience using the provider's definition: after graduation, full-time equivalent, eligible role types and overlapping jobs.
- Evaluate age and graduation requirements as of the specified date, not always today.
- Final-year students may need the degree by enrolment rather than application.
- A partial award can meet eligibility while failing the user's funding preference.

Preference sorting: initially use transparent filters and tie-breakers (subject preference, funding coverage, country preference, deadline). If a numeric relevance score is added later, publish its weights and label it as relevance, never admission probability. Readiness is a separate task-completion measure and must not imply admission success.

Cache matches by user, cycle, ProfileVersion and RuleVersion. Invalidate on changes. For 20–30 records, direct evaluation is acceptable; precompute asynchronously only after measurement.

## 8. Application workflow and API contracts

Application state: Planning → Preparing → ReadyForUserReview → Submitted → AwaitingDecision → Awarded / NotSelected / Withdrawn. Allow user corrections with history. Submitted is user-reported unless a future authorized integration supplies proof.

Maintain separate admission/funding tracks and explicit dependencies. Recommendation tasks distinguish “contact details entered”, “request sent”, and “recommendation received”; do not imply a stored PDF satisfies a portal submission. CMU-Africa, for example, asks for three recommenders' contact information [S19].

| Endpoint family | Operations |
| --- | --- |
| /api/v1/auth | Register, verify, login, logout, reset, session, CSRF token |
| /api/v1/profile | Read/update profile; separate education, experience and English-evidence collections |
| /api/v1/opportunities | Paginated published search, detail, related evidence and official links |
| /api/v1/saves | Save/unsave/list user's opportunities |
| /api/v1/matches | List explanations; evaluate selected cycle against current profile |
| /api/v1/applications | Create, list, detail, update status, tasks, references, export calendar |
| /api/v1/notifications | List/unread count/mark read/preferences |
| /api/v1/admin/cycles | Draft CRUD, validate, review, publish, correct, archive |
| /api/v1/admin/sources | Source register, fetch, review proposals, disable source |
| /api/v1/admin/imports — V1 | Editor/admin submits approved URL; 202 + durable operation ID; status, proposal, retry and accept/reject endpoints |
| /api/v1/source-suggestions — Phase 4 | Applicant submits a link for moderation; no immediate fetch |
| /api/v1/documents | Initiate, complete, list versions, authorized download and delete |
| /api/v1/webhooks/email | Signature-verified provider status events |
| /health/live and /health/ready | Process health and dependency readiness, no secret details |

Use ProblemDetails for errors, explicit DTOs, bounded pagination (default 20, maximum 100), ISO timestamps and typed enums. Never bind database entities directly from user input. Private endpoints infer UserId from the authenticated identity, not a submitted owner field. Use idempotency keys for application creation/import requests and optimistic concurrency for edits.

Core service interfaces: IEligibilityEvaluator, IOpportunityRepository (only if it meaningfully encapsulates catalogue querying), IEmailSender, IObjectStorage, ISourceFetcher, IExtractionService and IClock. Avoid an interface for every trivial class.

## 9. Email and notifications

### Channels and timing

- Phase 1: email verification and password reset through Resend; in development send only to Mailpit.
- Phase 3: in-app reminders plus user-enabled email reminders. Default proposed offsets: 14, 7 and 2 days before a verified deadline. Allow opt-out and preference changes.
- Deadline changes: immediate in-app notice after editorial approval; email if the user enabled it.
- Discovery digests: separate optional subscription; do not bundle marketing permission into account registration.
- Later: Telegram opt-in linking by a short-lived one-use code; web push only with explicit permission. SMS deferred pending provider access, cost and deliverability verification.

Configure a sending subdomain such as `notify.example.com`, SPF/DKIM and DMARC, and a monitored reply/support address. Purchase and verification are owner actions; no accounts or domain have been created by this plan.

Resend's published free tier includes a daily cap of 100 sends [S7]. Capacity must account for both daily spikes and monthly allowance. For example, 100 users receiving one reminder on the same day already consume 100 sends before signups/resets. Use in-app notices as a fallback and reserve email capacity for authentication. Do not assume free email is unlimited.

### Durable delivery design

1. In the same transaction as the relevant state change, create a notification and an outbox event.
2. A Quartz job polls due outbox records in small batches. Claim rows atomically using a short transaction and PostgreSQL row locks/SKIP LOCKED; set a lease and commit before network calls.
3. Send through Resend with a stable provider idempotency key derived from the logical delivery.
4. Record provider message ID and acceptance state. HTTP acceptance is not delivery.
5. Consume signed webhooks, deduplicate event IDs, and record delivery/bounce/complaint.
6. Retry transient failures with jitter, e.g. after 1 minute, 5 minutes, 30 minutes and 2 hours. Honor Retry-After and stop after a bounded attempt count.
7. Move exhausted or ambiguous deliveries to an admin review state. Never claim exactly-once delivery: provider/network failures can leave uncertainty.

Provider idempotency retention is finite; verify its current window and do not blindly resend unknown-outcome messages outside it. Permanent bounce/complaint suppresses future nonessential email. Do not retry invalid addresses indefinitely. [S9]

Reminder key: `(UserId, ApplicationId, DeadlineId, DeadlineVersion, Offset, Channel)`. Before sending, recheck deadline version, application status, user preferences and whether the event is still useful. Cancel old unsent reminders after deadline corrections. On recovery from an outage, consolidate missed reminders instead of sending all missed offsets at once.

Quartz handles recurring scans and job coordination; the application outbox handles business delivery state. Use PostgreSQL persistence and enable clustering before running multiple schedulers. Keep a worker heartbeat and an oldest-pending-message metric. Authentication emails can use the same outbox once Phase 3 ships; before then use a bounded synchronous send with a safe resend flow and no lost account state.

## 10. Source collection and editorial accuracy

### Initial source register

Start with official pages for a small selection of Erasmus Mundus programmes, DAAD awards and Mastercard Foundation partner universities, then other awards only when verified. These are candidate source families, not pre-approved scraper targets. Registration includes official domain, permitted paths, access/reuse review, contact if needed, parser type, last review and next fetch.

### V1 acquisition and importer implementation

**Finding a page and importing a page are different tasks.** In V1 the maintainer finds official opportunity URLs through provider catalogues, university pages and announcements, then pastes supported URLs into the admin importer. Applicants discover opportunities in the reviewed app catalogue. V1 does not automatically search the web or discover new pages.

1. Start with three manually verified examples, including one ambiguous deadline, to define required fields and unknown states.
2. Assess candidate sources for access/reuse conditions, static HTML availability, explicit intake information and stable structure. Select 2–3 specific domains/page patterns; source families above are research candidates, not confirmed integrations. Record supported fields and a manual fallback per adapter.
3. Implement `ISourceAdapter` with URL matching and deterministic extraction. Use HttpClient and AngleSharp; parse only fields supported by evidence. No paid AI, headless browser or search API is required. Complex eligibility prose stays as evidence for an editor to encode, not automatically executable rules.
4. Add an editor/admin-only import screen. Validate approved HTTPS host/path before accepting a job. Persist the request and its idempotency key before returning HTTP 202. Reject unsupported URLs with a manual-entry option, without fetching them.
5. Run the worker from Phase 1 with persistent Quartz and a durable database job state. Claim jobs with expiring leases; record attempts and parser version; recover abandoned jobs after restart. Suggested retry cap: three attempts for transient errors with backoff; parser/access errors go to review instead of endless retries.
6. Apply the fetch restrictions below, store permitted excerpts plus fetched time/hash, and extract title, provider, official links, intake, deadline wording and supported funding fields. Missing, contradictory or uncertain fields remain unknown and visibly flagged.
7. Show proposed values and evidence side by side. For a matching existing cycle, show a diff; do not create a new cycle merely because the page changed. An unclear intake blocks automatic association and requires an editor decision.
8. Let the reviewer correct/accept/reject each proposal, supply missing sources and validate the complete record. Approval creates or updates a draft; publishing remains a separate explicit editorial action with audit/version checks. Never overwrite current published facts from the worker.
9. Add source disable/retry controls and regression fixtures for valid pages, missing fields, old cycles, layout changes and conflicting dates. Re-importing the same page must not duplicate opportunities.
10. Expand to 10 reviewed catalogue entries, then 20–30 if ongoing verification is manageable. Demonstrate one supported import and one unsupported/manual fallback before Phase 1 closes.

Suggested job states: Queued → Running → AwaitingReview → Accepted / Rejected, with RetryScheduled and Failed branches. Accepted means a reviewed draft exists, not that it is published. Review the source freshness before publishing an old queued proposal. Concurrency/version checks prevent stale proposals overwriting newer editorial edits.

V1 supports on-demand admin imports and re-imports only. Scheduled discovery and page monitoring start in Phase 4. Retain the source register and manual-entry workflow even when all adapters are temporarily unavailable. Maintain evidence without retaining full pages indefinitely; set excerpt/snapshot retention according to each source's reviewed terms.

### Data rules

- Every record is tied to an intake/round. Never automatically advance the year.
- Application status: Unknown, Announced, Open, Closed or Withdrawn. Keep editorial publication status separate.
- Distinguish admission deadline, scholarship deadline, references deadline and document/offer deadline.
- If a source provides only a date, store date precision; do not invent 23:59 or a timezone. Prompt applicants to finish earlier and show uncertainty.
- Funding breakdown explicitly covers tuition, stipend, travel, insurance, visa and other costs with Unknown where needed.
- Original wording and source URL remain visible. Summaries do not replace evidence.
- A source being accessible does not grant unrestricted reuse; follow robots rules, site terms and agreed access conditions. Prefer concise extracted facts and links over republishing whole pages. [S20]

### Fetch and review pipeline

Approved URL → safe bounded fetch → source hash/excerpt → extraction proposal → validation → editor diff → publish new version → invalidate matches/update tasks/notify affected users.

Phase 4 scheduled policy (V1 uses manual review and on-demand re-import): open cycles daily if permitted; cycles near deadlines more often only where useful and permitted; closed/undated pages weekly or monthly. Verification freshness is distinct from fetch freshness: an unchanged page may still require human review. Set the first freshness target to seven days for open-cycle manual review and flag stale items visibly rather than hiding uncertainty.

Prioritize sources linked to saved applications when review capacity is limited. An unexplained disappearing deadline should trigger review, not an automatic deletion or reopening.

### Fetch security and limits

Only HTTPS approved domains/paths initially. Revalidate every redirect and DNS result; reject local/private/link-local/metadata destinations, unusual ports and non-HTTP schemes. Enforce network-level egress controls where possible. Proposed initial caps: 20-second fetch timeout, 5 MB HTML, 10 MB public PDF, at most three redirects, one concurrent fetch per domain, low requests per minute with backoff. Never bypass access controls or CAPTCHA. These controls address server-side request forgery risks [S11].

Raw HTML and PDF content are untrusted. Strip executable markup; do not render fetched HTML in the admin page. Isolate document parsers and browsers from credentials and internal services. The source worker should have narrower permissions than the web API.

## 11. Private files and AI

### File lifecycle

1. Authenticated user requests an upload slot; API checks quota and ownership.
2. API creates an opaque object key and PendingUpload record; supplies short-lived signed upload credentials.
3. Client uploads to a private quarantine location.
4. Completion endpoint verifies object existence, size, signature/MIME and checksum where supported. A client-supplied filename or MIME is not sufficient.
5. A restricted worker scans for malware using ClamAV or a vetted managed scanner, then marks the object Clean/Rejected. Allocate separate memory for the scanner; do not assume the smallest worker can run it.
6. Only Clean files can be downloaded or parsed. Authorization precedes each signed download URL; use a short expiry and attachment disposition.
7. Delete orphan uploads and expired quarantine files on a schedule.

Suggested beta quotas: PDF/DOCX only, 10 MB per file, 20 documents and 100 MB total per user. These are product limits to tune, not provider limits. Protect against compressed-document expansion and parser time/memory exhaustion. A blocked scan leaves the file quarantined. [S12]

### AI responsibilities

Use AI for draft extraction, source-grounded explanations and applicant-confirmed profile suggestions. Use deterministic code for published-rule evaluation and deadline arithmetic. Do not infer financial hardship, disability, ethnicity or other sensitive facts from a CV.

OpenAI structured outputs can enforce response shape; they do not establish factual accuracy [S13]. Store model identifier, prompt/schema version and source hash. Select a currently available low-cost model that passes your dataset; keep the model in configuration and record a tested snapshot when supported. This plan deliberately does not invent a model name or pricing quote.

Use a labelled evaluation set of at least 30 representative pages/PDFs: clear rules, ambiguous rules, old cycles, conflicting deadlines, missing timezones and blocked sources. Measure field accuracy separately. Any uncertain critical field remains unpublished until reviewed. Human confirmation remains mandatory for applicant-profile imports.

Treat documents as data, never as instructions. Extraction has no general browser tools, database write tools or cross-user retrieval. Store only necessary outputs, avoid logging raw private documents, and obtain consent before sending personal content to a provider. Review provider retention and account settings before activation.

Do not offer unrestricted essay generation. Chevening expressly prohibits AI-generated essay answers [S18]; store per-programme assistance policy if writing features are ever added.

### Cost controls

Reuse public-page extraction by content hash, not once per user. Put an application-enforced daily and monthly AI budget behind a kill switch; provider dashboard alerts alone are not a hard cap. Limit document pages, input/output tokens, concurrent requests and per-user runs. If AI fails or quota runs out, provide manual editing and keep existing verified matches available.

## 12. Security, privacy and account boundaries

- Identity handles password hashing and token issuance. Require verified email for personal workflows and MFA for editors/admins.
- Use Secure, HttpOnly, SameSite cookies and antiforgery protection for all cookie-authenticated state-changing endpoints, including uploads. Implement a shared React Fetch wrapper that attaches the API-issued antiforgery request token on unsafe methods; refresh it after login/logout. Keep the auth cookie HttpOnly and do not read it from JavaScript. [S10]
- Store no long-lived browser auth token in localStorage. Use a configurable session lifetime and security-stamp invalidation after password changes.
- Persist Data Protection keys across deployments/replicas in PostgreSQL and encrypt them with a certificate held in a restricted server secret file. Back up the keyring and certificate separately; rotation must preserve old decrypting keys. [S14]
- Enforce ownership on every API query, file request and nested relation. Route guards are UI convenience, not authorization.
- Editors can review public source records but should not automatically read applicant CVs or reference contacts.
- Separate production/staging secrets, databases, volumes, buckets when present, and sender settings. Staging uses fake users and an email recipient allowlist.
- Restrict DB networking and privileges. Only the migration job gets DDL privileges; normal runtime accounts do not.
- Redact passwords, tokens, email addresses, document text and signed URLs from logs and error traces.
- Protect public forms with per-account/IP rate limits and progressive abuse challenges; respect shared networks in Addis rather than blocking entire networks aggressively.
- Add CSP, HSTS after HTTPS validation, nosniff, safe link handling, dependency/container scans and secret scanning.
- Keep an audit trail for public fact corrections and administrative actions without copying unnecessary sensitive content.
- Provide data export, deletion, consent controls and a retention policy before recruiting real users.

Proposed retention defaults: operational logs 30 days; delivered notification content 90 days; failed/quarantine uploads seven days; pending unverified accounts 30 days; deleted active user data purged within 30 days. Backups expire under a documented schedule; record deletion tombstones so restored backups do not resurrect deleted accounts into service. Adapt defaults after a privacy review. Legal obligations and cross-border processing rules need a launch-specific review; this document is not a legal compliance determination.

## 13. Contabo, Nginx and release procedure

### Server and environments

Start with one Contabo VPS, approximately 4 shared vCPU / 8 GB RAM and sufficient SSD space for database, images and backup staging. This is a proposed pilot size, not a concurrency guarantee. Use Ubuntu Server 24.04 LTS. Choose a region after checking available plans and testing latency from Addis; advertised vCPU counts do not establish consistent performance on shared infrastructure. [S6]

Local uses Compose/PostgreSQL/Mailpit and fictional data. V1 staging can be an on-demand, resource-limited separate Compose project on the same VPS, with its own database, volumes, credentials and staging subdomain. It shares the host failure/security boundary and is not a substitute for an independent backup. Restrict staging access and stop it when unused. Run heavy load tests locally or on temporary isolated capacity, not beside live production users.

### Initial server setup sequence

1. Confirm VPS price, region, storage, IPv4, setup fees, renewal terms and available payment method. Purchase a domain if needed.
2. Create a non-root sudo operator, install SSH public keys, test a second login, then disable password/root SSH login. Record recovery-console access before tightening access.
3. Install security updates, Docker Engine/Compose, host Nginx, Certbot and backup tooling. Configure security update maintenance and a reboot procedure.
4. Set firewall rules: public HTTP/HTTPS; SSH restricted where practical. No public database or API port. Bind the API only to 127.0.0.1. Docker-published ports can bypass UFW expectations: verify exposure externally rather than relying on UFW alone. [S24]
5. Create separate release/config/data/backup directories, least-privilege ownership and log rotation. Protect secrets and the certificate used for ASP.NET Data Protection.
6. Deploy PostgreSQL with a persistent volume, a non-superuser app account and a separate migration account. Pin the major and use supported patches.
7. Deploy API and worker containers on private Compose networks. Configure restart policy, graceful shutdown, health checks and memory limits. Health checks alone do not automatically restart every unhealthy container; monitor and handle that condition.
8. Deploy React dist into a versioned directory, configure Nginx, validate with `nginx -t`, then reload.
9. Point DNS A/AAAA records at correctly configured addresses; omit AAAA until IPv6 routing/firewall is tested. Obtain Let's Encrypt certificates with Certbot and test automatic renewal. [S22]
10. Configure external uptime/certificate checks, daily off-server backups, and perform the first isolated restore before enrolling real users.

### Nginx routing specification

Host Nginx terminates HTTPS and serves the React build. The API container listens on host loopback port 8080. The example below is a **partial server-block routing template**, not a complete TLS/firewall deployment. Replace the domain and paths; Certbot supplies the certificate paths and HTTP-to-HTTPS configuration.

```nginx
# Inside the HTTPS server block after TLS has been configured:
server_name scholarships.example.com;
root /srv/scholarship/frontend/current;
index index.html;
client_max_body_size 2m; # V1 has no applicant uploads

location = /api { return 308 /api/; }
location ^~ /api/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_connect_timeout 5s;
    proxy_read_timeout 30s;
}
location ^~ /health/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $remote_addr;
}
location /assets/ {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
location = /index.html {
    add_header Cache-Control "no-cache";
}
location / {
    try_files $uri $uri/ /index.html;
}
```

The proxy_pass has no URI suffix, so `/api/v1/...` remains intact. Verify unknown API routes return API errors, never index.html. Add gzip, security headers and rate-limit zones to the complete configuration, accounting for Nginx header inheritance; apply limits carefully to login/reset/import routes and return 429 when exceeded. Keep private APIs uncached. Validate CSP against the actual React build. Nginx's reverse proxy behavior is documented in [S5].

Configure ASP.NET ForwardedHeaders middleware before HTTPS/auth middleware and trust only the actual Nginx peer address as seen by the container (often the Docker bridge gateway, not 127.0.0.1 inside the container). Do not trust arbitrary forwarded headers. The example assumes direct DNS-only access; adding Cloudflare proxy requires trusted proxy/IP handling changes. Retest redirect loops, secure cookies, reset links and rate-limit client addresses.

### CI/CD pipeline

1. Pull request: clean npm install, typecheck, Vitest/frontend build, .NET build/tests, integration tests and scans.
2. Produce API/worker images tagged by commit SHA and a matching React dist archive. Build away from the production VPS when possible.
3. Deploy to staging using a restricted SSH/deploy workflow. Keep secrets in server configuration; pin SSH host keys rather than disabling host-key checks.
4. Back up DB before a risky migration. Run one EF migration bundle with a migration lock/account; do not let every API container migrate at startup.
5. Run smoke tests: deep React link refresh, login/CSRF, saved listing, worker heartbeat and synthetic email.
6. Promote the exact image digests and matching frontend archive. Atomically switch the frontend `current` symlink and restart services in the documented order. Validate Nginx before reload.
7. Check API health, auth keys, pending jobs, logs and certificate status. Keep previous image digests and frontend releases for rollback.
8. Roll back code when schema-compatible; otherwise roll forward. A basic single-instance Compose replacement may briefly interrupt service. Do not promise zero downtime.

For later low-interruption releases, run a second API container on a different loopback port, verify readiness, switch the Nginx upstream, then drain the old container. Ensure sufficient RAM and backward-compatible schema/frontend changes. Multiple processes on one VPS still share a single host failure point.

GitHub Actions/registry usage must remain within account allowances. If exhausted, build locally, run checks, transfer the signed/checksummed release and invoke the same deployment script. Avoid placing a privileged CI runner on the production VPS for arbitrary pull requests.

### Configuration inventory

| Configuration | Purpose |
| --- | --- |
| Runtime and migration DB connections | Distinct privileges and bounded pools |
| Public app URL/allowed hosts | Trusted links and host validation |
| Nginx upstream/trusted peer | Same-origin proxy and accurate client scheme/IP |
| Resend key/from address/webhook secret | Email and verified delivery events |
| Data Protection certificate/password | Persistent cookie/token encryption; backed up separately |
| Backup target/key/retention | Encrypted off-server recovery |
| Optional Sentry DSNs | Sanitized errors within free allowance |
| R2 and AI credentials | Introduced later only when enabled |
| Feature flags | Imports, uploads, AI and optional channels |

Keep secrets out of Git, Vite public environment variables and image layers. Provide placeholder-only `.env.example`. Lock down server secret-file permissions; Docker access is effectively privileged. Validate required configuration at startup.

### Backups and recovery

PostgreSQL is now self-hosted: no managed PITR is included automatically. V1 baseline is a daily consistent `pg_dump -Fc` plus necessary roles/config and an encrypted copy off the VPS. Protect the Data Protection keyring/certificate and deployment configuration separately. Use restic or rclone plus encryption with a free storage allowance where available; R2's capped allowance is one option, subject to account setup and actual storage/operation usage. Do not expose backups through Nginx.

Suggested retention: seven daily and four weekly recoverable copies, adjusted for storage cost and data-retention policy. Monitor backup success and alert if the latest successful off-server backup is older than 26 hours. Do not copy a live PostgreSQL volume and call it a consistent database backup; use supported database backup tooling. [S15]

Contabo snapshots are optional pre-change aids, not a replacement for this process. Its Auto Backup is a separate paid add-on; do not include it silently in a free-first budget. [S25]

Pilot target: at most 24 hours of data loss and restoration within one working day, contingent on successful backups. Monthly drill: provision an isolated DB, restore the dump/config/keys, disable outbound mail, reapply deletion tombstones and verify records and ownership boundaries. Keep restore commands in the runbook. Add WAL archiving/pgBackRest for tighter recovery objectives later, with its own storage and testing budget. When Phase 5 adds documents, back them up and test linked-file recovery too.

## 14. Testing and acceptance gates

| Area | Required meaningful checks |
| --- | --- |
| Eligibility | AND/OR exceptions, missing values, GPA scales, nationality vs residence, overlapping experience, MOI ambiguity |
| Deadlines | Date-only, unknown zone, daylight-saving transition, expired cycle, changed deadline, Addis display |
| Authorization | User A cannot read/update/delete User B's applications, references, notes or files; editor boundaries |
| Auth | Verification, reset expiry/reuse, logout, CSRF failures, MFA and rate limits |
| Application workflow | Idempotent create, task dependencies, separate admission/funding tracks, non-destructive template update |
| Notifications | Worker crash before/after send, duplicate webhook, bounded retry, deadline correction, unsubscribe, missed schedule recovery |
| Imports — V1 gate | Supported adapters, manual fallback, durable restart recovery, editor authorization, Source duplicates, old year, malicious/private URL, redirect to private IP, parser errors, no evidence, conflicting pages |
| Documents | Oversized/disguised file, quarantined access, cross-owner linkage, expired signed URL, deletion and orphan cleanup |
| AI | Prompt injection, missing evidence, invalid schema, incorrect year, cost cutoff, disabled-provider fallback |
| Deployment | Persistent login keys, migration concurrency, previous image compatibility, worker shutdown/restart |
| Recovery | Actual restore with email disabled and deleted accounts still blocked |
| Responsive UI | Viewport sweep 320–2560 CSS px, intermediate widths, zoom/reflow, touch/keyboard, long text and three browser engines |
| VPS/Nginx | TLS renewal, deep-link refresh, API 404 isolation, no exposed DB port, forwarded headers and disk/backup alerts |

Initial load-test workload: 50 concurrent virtual users for 15 minutes, mainly browsing with occasional profile/save/task writes; then a burst of 500 due notification records. Use isolated/local staging and mocked email for load tests; do not stress a staging project sharing the live production VPS. This is a test target, not a claim that a particular instance can support it.

Suggested acceptance targets: p95 normal API response under 700 ms within the hosting region (excluding uploads/AI), error rate under 1%, and no lost/duplicated logical application records. Test actual mobile perceived performance separately from server latency. Outbox should recover from restart and drain within the application's chosen reminder tolerance without exceeding provider quotas.

## 15. Load management and scaling

### Launch controls

- Bound pagination, upload size and extraction input.
- Add indexes based on real query plans; avoid loading full profiles/documents for catalogue screens.
- Use asynchronous I/O, cancellation and explicit network/database timeouts.
- Run email/source/AI jobs outside HTTP requests; return operation IDs for long work.
- Start with one API container and one worker on the VPS. Separate source jobs from reminder dispatch using concurrency limits and priority.
- Start source concurrency at one per domain and two overall; AI concurrency at one or two. Increase only after measuring memory and quotas.
- Cap Npgsql pools for every process and scheduler. Account for rolling-deploy overlap: `web replicas × web pool + workers × all worker pools + migration/admin reserve < database connection limit`.
- Example starting pools: web 15, worker application 8, Quartz 5, reserve 10. Validate against PostgreSQL max_connections and available RAM; do not adopt this example blindly.
- Cache only public catalogue queries briefly; invalidate on publication. Never cache private responses publicly.
- Apply account-level quotas for imports and AI so scaling cannot create uncontrolled bills.

### Scale triggers

| Observed condition | First action | Next action if needed |
| --- | --- | --- |
| Slow catalogue/API | Inspect slow queries, payload sizes and indexes | Increase web instance, then replicas |
| Sustained CPU or memory pressure | Profile and remove expensive synchronous work | Increase size or add web replicas |
| Reminder queue age above five minutes with capacity available | Investigate worker/provider failures | Add dedicated notification worker capacity |
| Scrapes blocking reminders | Separate queues/jobs and reduce scrape concurrency | Dedicated scraper service |
| DB connection pressure | Reduce pool sizes and fix long transactions | Add PgBouncer only if needed and tune DB [S21] |
| Repeated read-heavy catalogue load | Short public cache and HTTP caching | Shared Valkey cache if useful |
| Matching expensive across a larger catalogue | Versioned background precomputation | Batch jobs and incremental invalidation |
| Provider quota/cost exceeded | Pause optional jobs; preserve account and reminder flows | Upgrade only after reviewing usage |

Multiple replicas require shared Data Protection keys, distributed rate-limit strategy, coordinated scheduler configuration and idempotent jobs. In-memory rate limits are per process; do not treat them as global after scaling. Durable outbox state remains authoritative even if a cache disappears.

A single Contabo VPS has no application autoscaling by default. Scale manually after measurement; extra containers on the same host share its CPU/RAM and do not add host-level availability. Nginx can distribute traffic across API replicas later. Add a second host only when demand or recovery requirements justify its cost. Account count alone is not a scaling signal; concurrent requests, DB workload, job lag and cost are.

## 16. Free-first V1 budget and operating work

V1 is Phases 0–3. Open-source software is free to use, but the VPS, domain, storage beyond allowances and your operating time are not. These are planning allowances, not a Contabo checkout quote. Confirm taxes, region/IPv4/setup fees, renewal pricing, available payment method and any backup add-ons before purchase. [S6]

| Item | V1 choice | Cost approach |
| --- | --- | --- |
| React/.NET/PostgreSQL/Nginx/Quartz | Open-source software | No software licence subscription |
| API + worker + database hosting | One Contabo VPS | Budget approximately $6–15/month pending exact plan/region/fees |
| Domain | One domain | Approximately $10–25/year allowance; verify registrar renewal |
| HTTPS | Let's Encrypt/Certbot | Free certificates |
| DNS | Cloudflare Free DNS | No paid DNS plan required |
| Email | Resend free allowance | Target $0; track daily/monthly usage and reserve authentication capacity |
| Backups | Encrypted off-server copies | Aim for free storage allowance; reserve $0–5/month if exceeded |
| Monitoring | Logs + external free-tier uptime; optional Sentry free tier | Target $0; disable optional event collection at cap |
| CI/registry | Account's included allowances | Target $0; local build/deploy fallback |
| Staging | Separate on-demand Compose project on same VPS | No second server initially; isolation and resource limits required |
| AI/SMS/paid UI | Disabled in V1 | $0 |
| Applicant files | Readiness metadata only in V1 | No upload storage/scanning bill yet |

Working pilot allowance: **about $6–20/month plus the domain**, before tax, one-time charges and any paid upgrade. It is not guaranteed all-inclusive pricing. If you already have spare Contabo capacity, incremental hosting spend may be lower, but resource limits and isolation from existing apps still matter.

At quota limits: pause discovery digests and optional processing, keep in-app notifications available, expose email delays honestly, and ask the owner to choose an upgrade if essential sends cannot fit. Do not queue a reset email so long that its token expires. V1 must not silently enable paid overages. Set budget notifications and use actual service usage counters.

A single VPS saves recurring service fees while transferring patching, database administration, certificate renewal, disk monitoring and recovery to you. Monitor memory, disk, inode usage, CPU steal/load, DB health and worker heartbeat. Start disk alerts around 70% warning and 85% urgent, then tune. Rotate Docker/Nginx/application logs and prune old images through a controlled retention policy; never delete live database volumes.

Check urgent source/deadline reports during open application periods; inspect backups, failed deliveries and stale listings weekly; patch dependencies/OS and test recovery monthly. Set a maintenance window and record reboot/restore steps. Reserve **24–40 hours** for the V1 importer beyond the original feature estimate and **16–32 hours** for learning React and VPS administration. The revised V1 planning range is **162–252 hours**, roughly 9–17 weeks at 15–20 hours/week. This is an estimate, not a promise.

## 17. First ten implementation work sessions

Sessions are work blocks, not promises of one calendar day each.

1. Create repo, project skeleton, decision notes and CI build.
2. Start Postgres/Mailpit; add first migration and fictional listing.
3. Implement listing endpoint and generated client.
4. Build responsive catalogue card/detail layouts and error/loading states.
5. Deploy the thin slice to staging; prove DB connection and rollback.
6. Add Identity, cookies, CSRF, email verification and login.
7. Add admin role/MFA and a structured cycle form.
8. Add field evidence, draft/review/publish and audit trail.
9. Enter three real verified cycles; test unknown deadlines and funding fields.
10. Add save/unsave; assess and register the first supported source, then implement the safe fetcher, durable import worker and proposal review. Complete 2–3 adapters and the Phase 1 gates before starting profile matching.

For each session, end with working behavior and one meaningful verification. Do not create all future infrastructure first.

## 18. Implementation ticket backlog

| ID | Ticket | Depends on | Acceptance |
| --- | --- | --- | --- |
| F01 | Clean repo and framework scaffold | — | CI builds frontend/backend |
| F02 | Compose and EF migration | F01 | Fresh DB can be created from migration |
| F03 | Catalogue vertical slice | F02 | Browser reads seeded record |
| F04 | Docker staging deploy | F03 | Health, DB read and rollback work |
| C01 | Identity/cookie/CSRF | F04 | Verification/reset and cross-user tests pass |
| C02 | Catalogue schema and evidence | F02 | Cycle/intake/deadline precision represented |
| C03 | Admin publication workflow | C01,C02 | Draft cannot appear publicly |
| C04 | Browse/filter/save | C03 | Bounded results and user-owned saves |
| R01 | Responsive React shell and forms | F03 | Viewport sweep, zoom, long text and keyboard checks pass |
| V01 | Contabo/Nginx/TLS setup | F04 | API private, deep links work, renewal and external port check pass |
| C05 | Seed verified catalogue | C03 | Critical fields have evidence or unknown state |
| D01 — Phase 1 | Source register/safe fetcher | C03 | 2–3 source patterns assessed; private/redirect URL tests blocked |
| D02 — Phase 1 | Durable worker/Quartz, 2–3 adapters and proposal review | D01 | Restart-safe jobs; evidence/diff review; no duplicates or direct publication; manual fallback |
| M01 | Profile forms/versioning | C01 | Original GPA scale and residence retained |
| M02 | Rule evaluator | C02,M01 | Four-state cases and ALL/ANY tests pass |
| M03 | Match explanations | M02,C04 | Reasons link to sources |
| A01 | Task templates/dependencies | C02 | Versioned template validated as acyclic |
| A02 | Application workspace | A01,C01 | Idempotent create, private tasks and tracks |
| A03 | References/reusable fields | A02 | No automatic external sending or submission |
| N01 | Extend import worker with notification outbox | A02,D02 | Restart-safe claim/retry behavior; imports cannot starve reminders |
| N02 | Email adapter/webhooks | N01 | Signed events and duplicate handling |
| N03 | Reminder planning/preferences | N02 | Deadline changes cancel stale pending sends |
| O01 | Observability/alerts | F04 | Maintainer receives synthetic failure alert |
| O02 | Backup/restore/delete | C01 | Isolated restore and deletion safeguards pass |
| O03 | Pilot tests/load/UX | M03,A03,N03,O01,O02,R01,V01,D02 | Phase 3 gate including V1 imports met |
| D03 — Phase 4 | Listing discovery, change detection/rechecks and PDF adapter | D02,N01 | Bounded discovery; duplicate/old-cycle fixtures handled; changes require approval |
| U01 | Private storage/quarantine | O02 | No unscanned or cross-owner download |
| U02 | Document versions/checklist links | U01,A02 | Task links stay on chosen version |
| I01 | AI structured extraction/evals | D02 | Critical fields reviewed; costs capped |
| I02 | CV profile suggestions | I01,U02,M01 | User accepts edits; no silent overwrites |

## 19. Decisions deliberately deferred

- Brand/domain name: use a neutral working name until availability is checked.
- Exact Contabo plan/region: validate 4 shared vCPU / 8 GB starting capacity against actual workload and checkout total.
- Exact AI model: choose only when Phase 5 evaluation exists and account access is confirmed.
- Subscription/payments: first establish repeat usage and a willingness-to-pay hypothesis. Validate Ethiopian merchant/provider onboarding separately before a payments design.
- Universal scraping, automated essays, automatic submissions, native mobile applications, Redis, vector search and Kubernetes: not prerequisites.

This is an implementation specification, not a claim that software has been built or deployed. The immediate deliverable to implement is Phase 0's database-backed catalogue page; the first complete product release is Phase 3.

## 20. Official sources and verification notes

Version 1.2 is a scope and implementation-order revision. It does not certify any candidate source as scrape-ready or refresh vendor pricing/version claims; validate those during Phase 0 and source onboarding.

Original sources checked on 19 October 2026; React, Contabo, Nginx, email and server-operation references reviewed on 20 October 2026. Product architecture, effort, quotas and budgets above are proposed engineering decisions, not vendor promises. Websites establish documentation and capabilities; they do not verify access under your personal account or payment method.

- **S1 — React/Vite setup:** https://react.dev/learn/build-a-react-app-from-scratch and https://vite.dev/guide/
- **S2 — .NET support policy:** https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core
- **S3 — Npgsql EF Core 10:** https://www.npgsql.org/efcore/release-notes/10.0.html
- **S4 — Quartz:** https://www.nuget.org/packages/Quartz and https://www.quartz-scheduler.net/documentation/quartz-4.x/tutorial/job-stores.html
- **S5 — Nginx reverse proxy:** https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy
- **S6 — Contabo plans/specifications:** https://contabo.com/en/pricing/ and https://docs.contabo.com/docs/servers-hosting/vps/
- **S7 — Resend pricing:** https://resend.com/pricing
- **S8 — R2 pricing and compatibility:** https://developers.cloudflare.com/r2/pricing/ and https://developers.cloudflare.com/r2/how-r2-works/
- **S9 — Resend delivery idempotency/webhooks:** https://resend.com/changelog/idempotency-keys and https://resend.com/changelog/managing-webhooks-via-api
- **S10 — ASP.NET Core antiforgery:** https://learn.microsoft.com/aspnet/core/security/anti-request-forgery?view=aspnetcore-10.0
- **S11 — OWASP SSRF prevention:** https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
- **S12 — OWASP file upload:** https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- **S13 — OpenAI structured outputs:** https://developers.openai.com/api/docs/guides/structured-outputs
- **S14 — ASP.NET Core Data Protection:** https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/configuration/overview
- **S15 — PostgreSQL logical backups:** https://www.postgresql.org/docs/17/backup-dump.html
- **S16 — Erasmus Mundus student guidance:** https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters
- **S17 — Mastercard Foundation handbook:** https://mastercardfdn.org/en/mastercard-foundation-scholars-program-handbook/
- **S18 — Chevening AI policy:** https://www.chevening.org/faqs/can-i-use-ai-to-help-me-write-my-application/
- **S19 — CMU-Africa application step:** https://www.africa.engineering.cmu.edu/admissions/how-to-apply/step-1.html
- **S20 — Robots Exclusion Protocol:** https://www.rfc-editor.org/rfc/rfc9309.html
- **S21 — PostgreSQL connections:** https://www.postgresql.org/docs/17/runtime-config-connection.html
- **S22 — Let's Encrypt:** https://letsencrypt.org/getting-started/
- **S23 — Angular integrated features:** https://angular.dev/docs
- **S24 — Docker/firewall interaction:** https://docs.docker.com/engine/network/packet-filtering-firewalls/
- **S25 — Contabo backup add-on:** https://docs.contabo.com/docs/servers-hosting/vps-auto-backup/
- **S26 — TanStack Query:** https://tanstack.com/query/latest/docs/framework/react
