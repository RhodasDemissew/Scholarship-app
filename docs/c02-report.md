# C02 - Protect accounts and editor access

Completed 23 October 2026.

Applicant registration cannot choose roles. An explicit operator command grants Editor
or Administrator to an already verified account and invalidates its sessions. Editor
and Administrator policies require the role plus a verified MFA authentication claim.
Added authenticator setup/enable and two-factor login, with lockout on failed codes.
Auth routes are limited to 20 requests per route/IP/minute (CSRF acquisition exempt).
Persistent keys are encrypted with Windows DPAPI locally; other environments require
Security:CertificatePath/CertificatePassword and support Security:KeyPath. .local is ignored.

Checks: Release build passed with zero warnings/errors; frontend build passed. C02
Playwright test passed for anonymous/applicant/editor/admin boundaries, invalid MFA,
password-only denial, second-factor login and 429 throttling. Encrypted key XML contained
an encryptedSecret and no plaintext master key. A saved administrator MFA session
still returned 200 after API restart. Tests caught and fixed security-stamp invalidation
during authenticator setup and loss of the MFA claim during routine principal refresh.

Operator command (from src/Scholarship.Api, Development):
`dotnet bin/Release/net10.0/Scholarship.Api.dll --grant-role verified@email Editor`
Then sign in again and visit /security. No public role-assignment endpoint exists.
MFA recovery is deliberately not exposed in this milestone; retain the authenticator.
Deployment must supply/backup the key encryption certificate separately (later operations tasks).
