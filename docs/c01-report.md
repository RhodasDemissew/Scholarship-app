# C01 - Signup and secure sessions

Completed 23 October 2026.

ASP.NET Core Identity now stores users/password hashes in PostgreSQL. Added registration,
Mailpit verification/resend, cookie sign-in/out, password reset, session and CSRF endpoints,
with React forms and a shared unsafe-request wrapper. Passwords require 12 characters and
Identity complexity; tokens expire after one hour. Reset changes the security stamp, so
old sessions and reused reset tokens fail. Responses use ProblemDetails; auth is HttpOnly
and SameSite Strict (Secure in production; local HTTP development is explicitly allowed).

Verification: frontend build passed; API Release build and Accounts migration passed.
Playwright accounts.spec.ts passed: missing CSRF rejected, unverified login rejected,
Mailpit verification/reset, cookie attributes, reset reuse, invalidated session, logout,
and actual browser login/logout. Initial attempts failed on a stale executable and
Windows DPAPI sandbox access; rerun with the rebuilt API and normal Windows identity passed.

Try /register, open http://127.0.0.1:8025, verify, sign in, and use Forgot password.
Live email is intentionally unconfigured; LocalMail refuses non-Development delivery.
MFA, role enforcement, rate limits and explicit persistent key configuration are C02.
