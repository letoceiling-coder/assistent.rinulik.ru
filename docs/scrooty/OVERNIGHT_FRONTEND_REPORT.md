# Scrooty — overnight marketing frontend build

Branch: `feat/scrooty-marketing-frontend-v1` (pushed to `origin`). Backend, product app and database untouched.

## 1–3. Commits

- Starting point of the overnight run: `f0c855d` (Stage 03, header & navigation).
- Final commit: see `git log -1` on the branch (this report is part of it).
- Commits created overnight:
  - `8cc4645` feat(scrooty): build product-led homepage hero and demo preview
  - `2944b88` feat(scrooty): add interactive demo state, scenario sandbox and registration gates
  - `292092d` feat(scrooty): add channel, human proof, how-it-works, knowledge, actions and handoff sections
  - `f90ceff` feat(scrooty): add cabinet, use cases, trust, pricing, partners, FAQ, final CTA and footer
  - `a94e3e5` feat(scrooty): build pricing, partners, channel, integrations and demo pages with route metadata
  - `3284373` feat(scrooty): responsive, accessibility and motion pass; document backend dependencies
  - final: docs(scrooty): overnight frontend report

## 4. Implemented routes (9)

`/`, `/pricing`, `/partners`, `/avito-ai`, `/telegram-ai`, `/max-ai`, `/site-ai`, `/integrations`, `/demo`.
Each has a unique H1, composition, title/description/canonical/OG (client-side). No SkeletonPage left.
Product routes (`/login`, `/register`, `/reset-password/*`, `/app/*`) still render the existing product app unchanged.

## 5. Homepage sections (15)

Hero + demo · Channels (`#features`) · Human proof (`#human-proof`) · How it works (`#how-it-works`) · Knowledge (`#knowledge`) ·
Actions (`#actions`) · Handoff (`#handoff`) · Cabinet (`#cabinet`) · Use cases · Trust · Pricing preview (`#pricing`) ·
Partners teaser (`#partners`) · FAQ · Final CTA · Footer. All navigation anchors are now live.

## 6. Design system

Soft Signal Premium tokens (`resources/css/marketing/tokens.css`), self-hosted Inter (latin, cyrillic, latin-ext),
fluid type scale 360→1440, 1360px container, radius/shadow/motion tokens, focus ring, reduced-motion foundation.
Shared patterns in `resources/css/marketing/components.css`; components keep their CSS next to them.
Primary CTA = orange with dark foreground (AA). Chips/badges use pill radius; buttons use 14px.

## 7–8. Brand assets

- Originals (untouched, outside the repo): `/Users/neeklo/projects/scrooty ai assistent/Лого контент/logo.png`, `mascot.png`.
- Production copies (cropped + resized, WebP, tracked): `resources/images/marketing/scrooty-logo.webp` (332×96, 5 KB),
  `resources/images/marketing/scrooty-mascot.webp` (256×256, 10 KB). OG image: `public/og/scrooty-og.png` (1200×630, from the logo).
- Logo has no alpha: rendered with `mix-blend-mode: multiply` on the ivory canvas. Mascot used twice (hero, handoff), round crop, fixed size.

## 9–10. Demo

`resources/js/marketing/demo/`: `useDemoSession` (explicit states idle / editing / sending / typing / complete / soft-gate /
hard-gate / network-error / safety-refusal / session-expired / daily-limit), `DemoProvider` (one engine per page: hero, final CTA
and `/demo` share it), `transport.ts` (`DemoTransport` contract + `sandboxTransport`), `storage.ts` (sessionStorage).
Limitations (honest fallback): no anonymous AI API — answers are prepared scenario texts labelled «Демо на готовых сценариях» /
«Пример ответа»; free text that matches no scenario gets an explicit sandbox note. No network calls, no fake latency.
Gates: soft after the 3rd answer, hard on the 5th send; hard-gate body adapted (the dialog is not transferred to the account yet).

## 11. Backend TODOs

See `docs/scrooty/frontend-backend-todo.md`: anonymous demo API, demo → registration transfer, `/signup` alias,
server-side meta/SSR/sitemap/noindex/404, partner applications endpoint, trial & plans in billing, legal texts & requisites,
integration statuses (Avito, site widget, Sheets, Bitrix24, webhook actions, API), contact channel, favicon, knowledge sources copy.

## 12. Bundle sizes (production build)

| Asset | Size | gzip |
|---|---|---|
| entry `app-*.js` (React + bootstrap, shared) | 225.9 kB | 70.4 kB |
| `MarketingApp-*.js` | 115.6 kB | 30.2 kB |
| `MarketingApp-*.css` | 53.7 kB | 9.4 kB |
| Inter latin / cyrillic / latin-ext (woff2, loaded by unicode-range) | 48.3 / 18.8 / 85.1 kB | — |
| logo / mascot (WebP) | 5.1 / 9.9 kB | — |
| `ProductApp-*.js` / `.css` (unchanged, not loaded on marketing) | 88.7 / 27.3 kB | 23.1 / 6.9 kB |

No new dependencies besides `@fontsource-variable/inter` (Stage 02).

## 13. Responsive QA

All 9 routes checked for horizontal overflow at 360, 375, 390, 430, 768, 1024, 1280, 1440: none.
Visual review at 1440 / 1280 / 1024 / 768 / 375 / 360 for home, pricing, partners. Tables scroll inside their own region.

## 14. Accessibility QA

One H1 per route; no heading level skips on the homepage; all controls named; images have alt; skip link; sticky header
scroll-padding; tabs (roving tabindex, arrows/Home/End), native `<details>` FAQ, radio-group billing toggle, labelled calculator
fields with a live result, demo `aria-live="polite"`, gate focus management, native modal drawer, visible focus, reduced motion
(section reveal is CSS scroll-driven and off with reduced motion).

## 15. Checks

`npx --no-install tsc -p tsconfig.json --noEmit` — 0 errors. `npm run build` — OK. `git diff --check` — clean.
No lint or frontend test tooling exists in the repository (none added).

## 16–18. Deployment

- Found: production `https://scrooty.ru` is deployed by `deploy/scrooty/deploy.sh` on the server: `git reset --hard origin/scrooty`,
  `docker compose build`, `php artisan migrate --force`, `up -d`. No CI/CD, no preview/staging environment.
- Result: **not deployed.** Deploying requires merging this branch into the release branch `scrooty` and running the script on
  a server with live users and data (it also runs migrations). By policy that is a human decision.
- Preview URL: none available.

## 19. Remaining blockers / notes

- Initial HTML is still the shared Blade shell (title «ASSISTENT…») until the backend meta step; marketing sets meta client-side.
- After deploy, `/` shows the marketing site for everyone, including logged-in users (cabinet stays at `/app/*`, login at `/login`).
- The product app itself still uses the old name/visuals (out of scope).
- Approved copy mentions a 7-day trial and plans that billing does not implement yet.

## 20. Human actions in the morning

1. Review the branch on a local build (`npm ci && npm run build`, then `php artisan serve`).
2. Decide on backend items in `frontend-backend-todo.md` (trial/plans, legal texts, contact channel, Avito status).
3. If approved for production: fast-forward `scrooty` to `feat/scrooty-marketing-frontend-v1`, push, then on the server run
   `sh /opt/scrooty.ru/deploy/scrooty/deploy.sh`.
