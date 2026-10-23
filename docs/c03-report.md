# C03 - Opportunity identity, intake and round

Completed 23 October 2026. Added Institution, Programme and FundingAward entities with
foreign keys and stable unique identities. Cycles reference programme/optional award,
intake and round. PostgreSQL NULLS NOT DISTINCT prevents duplicate no-award cycles.
PublicationStatus is independent from ApplicationStatus. Version is an EF concurrency
token; LastReviewedAt is reserved for the editorial workflow. Existing fictional data
was preserved and linked to an explicitly fictional institution/programme.

Verification: Release build and CatalogueIdentity migration passed. The rollback-only
SQL test tests/catalogue-identity.sql rejected a duplicate without an award, accepted a
separate round/intake, and retained Draft/Open as independent states. Public listing
now selects Published rows only. Editing and stale-version HTTP behavior follow in C05.
