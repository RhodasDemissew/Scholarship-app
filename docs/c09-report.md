# C09 - Responsive shell and accessible forms

Completed 23 October 2026. Responsive layouts and accessibility compliance verified across
public browsing, applicant account flows, and the editorial workspace.

Layouts adapt smoothly from 320px mobile viewports up to 2560px ultra-wide displays without
horizontal overflow (`scrollWidth <= innerWidth`). Supports 400% zoom reflow and 200% text
enlargement. Long unbroken text strings wrap safely using `overflow-wrap: anywhere`.

Keyboard interaction includes a skip link (`Skip to content`) focused on initial Tab,
automatic main region focus and page scroll reset on route changes, descriptive dynamic document
titles per route, and distinct high-contrast `:focus-visible` outlines. Reduced motion
preferences (`prefers-reduced-motion`) disable transitions and smooth scrolling.

Form fields feature explicit `<label>` bindings, structured `<fieldset>` and `<legend>` groupings,
standardized checkbox sizing, and accessible error alerts. Submitting invalid forms moves focus
directly to the first erroneous control with descriptive validation messages.

Verification: Frontend build passed with zero TypeScript errors. Playwright
`accessibility.spec.ts` passed 2/2 tests verifying WCAG 2.0 A, 2.0 AA, and 2.1 AA rules via
axe-core across `/`, `/opportunities/:id`, `/register`, `/saved`, and `/editor/new`, with no violations.
Responsive viewport sweeps (320, 375, 480, 640, 768, 1024, 1440, 1920, 2560 px) and reflow checks
passed.
