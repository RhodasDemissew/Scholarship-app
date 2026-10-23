# C10 - Public fictional sample journey and catalogue protection

Completed 23 October 2026. A dedicated public demonstration route (`/demo`) allows prospective applicants,
partners, and visitors to explore a complete applicant journey without creating an account or signing in.

The demonstration features realistic, explicitly fictional personas (e.g. Amara Chen from Kenya, Lucas Silva
from Brazil) detailing citizenship, education credentials, standardized English test results, and professional
experience. It visualizes automated eligibility evaluation against real and demonstration opportunities
(ETH Zurich ESOP, Cambridge Trust, Fictional Example Fellowship) with criteria matching summaries.

Visitors can interact with demonstration milestone checklists and local shortlist saves held safely in
browser memory. Shared catalogue data and editorial records remain strictly protected against unauthorized
mutations. API mutation endpoints (`/api/v1/editor/opportunities`, `/api/v1/me/saved`) enforce server-side
authentication and role-based authorization, rejecting anonymous requests with HTTP 401 Unauthorized or
403 Forbidden.

Verification: Frontend build passed with zero errors. Playwright `demo.spec.ts` passed verifying:
- Unauthenticated access to `/demo` without cookies or tokens.
- Interactive candidate persona switching.
- Interactive milestone task checkbox toggling in local state.
- Demo shortlist save/unsave toggling without account mutation.
- Verified server-side catalogue mutation rejection (401/403).
- Zero WCAG 2.0 A, 2.0 AA, and 2.1 AA violations via axe-core audit.
- Responsive viewports from 320px to 2560px with no horizontal overflow.
