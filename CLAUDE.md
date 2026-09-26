# Scrooty Frontend Project Instructions

## Mission

Build the public Scrooty marketing frontend gradually, safely and architecturally.

The canonical product/design/content specification is:
`SCROOTY_LANDING_SPEC.md`

Treat it as the source of truth for:
- product positioning
- spelling and terminology
- page structure
- copy
- design tokens
- responsive behavior
- interaction patterns
- animation
- accessibility
- SEO
- analytics
- QA

Do not improvise product facts that contradict the specification.

## Absolute scope boundary

This work is FRONTEND ONLY.

Allowed:
- marketing React/TypeScript components
- shared frontend UI primitives
- marketing route components that already exist in the frontend
- CSS and design tokens
- frontend state
- client-side interaction
- responsive behavior
- accessibility
- frontend analytics wiring to existing interfaces
- SEO metadata where supported by the current frontend architecture
- tests for frontend code

Forbidden unless the user explicitly asks in a separate task:
- backend business logic
- Laravel controllers/models/services
- database schema or migrations
- API contracts
- auth backend
- billing backend
- queues/workers
- server infrastructure
- changing API field names
- inventing missing endpoints
- changing integrations on the server
- Composer dependencies
- deployment
- pushing or merging branches

If a frontend requirement needs a backend change, STOP that part and report the dependency. Do not solve it by changing backend code.

## Git safety

All implementation must happen on a dedicated frontend feature branch.

Preferred branch:
`feat/scrooty-marketing-frontend-v1`

Before edits:
1. inspect `git status`
2. inspect current branch
3. inspect uncommitted changes
4. never discard, reset, stash or overwrite user work automatically

If unrelated uncommitted changes exist, report them before modifying overlapping files.

Never:
- commit directly to main/master
- merge
- rebase main
- force push
- push remotely

Local checkpoint commits on the Scrooty feature branch are allowed after a completed verified stage. Never push them unless explicitly requested.

## Product naming

Always write:
`Scrooty`

Never use:
- SCROOTY
- ScRooty
- Скрути in product UI
- ASSISTENT
- old product naming

User-facing category:
`AI-менеджер`

Technology stays in the background. Human communication stays in the foreground.

## Product UX principle

The public site is:
- pain-first
- product-first
- demo-first
- human-first
- mobile-first

A visitor should understand the product in approximately five seconds.

Do not lead with technical architecture, LLM models, RAG, embeddings, OpenRouter or function-calling terminology on marketing surfaces.

## Visual direction

Use the approved Scrooty visual language only.

Core character:
- premium light SaaS
- ivory canvas
- white and soft neutral surfaces
- restrained shadows
- warm orange primary action
- pastel blue/periwinkle/butter/mint/peach as secondary signals
- calm product UI
- generous whitespace
- Inter typography
- real interface as visual proof

Avoid:
- purple as primary
- neon
- cyberpunk
- generic AI gradients
- random glassmorphism
- excessive 3D
- WebGL without a product reason
- parallax abuse
- cursor-follow effects
- giant decorative blobs
- fake screenshots
- fake metrics
- fake logos
- fake reviews

## Frontend architecture

First inspect the repository. Adapt to its existing conventions instead of blindly imposing a new framework.

Preferred conceptual separation:
- `marketing/`
- `product/`
- `shared/`
- design tokens / global styles
- route-level pages
- reusable UI primitives
- reusable marketing sections
- typed data/config

Use separation of concerns.

Prefer:
- small focused components
- composition
- explicit props
- typed configuration
- one source of truth
- minimal state
- derived values instead of duplicated state
- local state for local interaction
- route/page ownership for page-specific data

Do not create a component only to move five lines into another file. Extract components when they have a clear responsibility, reuse value or independent interaction.

Do not create a huge `HomePage.tsx` with all markup and state.

Do not create a global store for static marketing content.

Do not duplicate:
- navigation
- pricing
- channel definitions
- integration statuses
- route metadata
- repeated CTA labels
- plan limits

Centralize repeated business/display data in typed frontend config only when it is genuinely shared.

## CSS architecture

Prefer the current repo styling approach if healthy.

Create and use approved semantic tokens.

Do not scatter hardcoded brand colors across components.

Separate:
- reset/base
- tokens
- typography
- marketing layout/utilities where appropriate
- component styles according to the repo convention

Use fluid responsive CSS where possible.

No horizontal page scroll at 360 px.

All grid/flex children that can shrink should be reviewed for `min-width: 0`.

## Responsive baseline

Review at:
360
375
390
430
768
1024
1280
1440

Mobile is not a compressed desktop.

Mobile priorities:
1. message first
2. demo visible early
3. CTA visible without hunting
4. no decorative overflow
5. mascot smaller
6. pricing cards vertical
7. avoid carousels unless unavoidable

## Accessibility

Target WCAG 2.2 AA or better.

Required:
- semantic headings
- one H1 per page
- keyboard navigation
- visible focus
- skip link
- accessible labels
- error announcements
- `aria-live` for dynamic demo responses where appropriate
- accessible tabs/accordion/drawer/dialog behavior
- focus trap only where appropriate
- Escape closes dismissible overlays
- no color-only state
- reduced motion support
- minimum practical touch targets of 44x44 for key controls

Do not hide focused elements beneath sticky UI.

## Motion

Scrooty is alive but calm.

Motion should clarify hierarchy and state, not decorate.

Typical durations:
- hover: ~140 ms
- popover: ~160 ms
- message: ~180 ms
- modal: ~220 ms
- drawer: ~280 ms
- section reveal: ~420 ms
- mascot reaction: ~240–420 ms

Always support `prefers-reduced-motion`.

## Performance

Preserve a lightweight marketing bundle.

Do not make public marketing visitors load the full admin/product application unless the current architecture requires it and no safe split exists.

Targets:
- LCP <= 2.5 s
- CLS <= 0.1
- INP <= 200 ms goal

Avoid oversized hero media, layout-shifting assets and unnecessary runtime animation libraries.

Prefer CSS for simple visual transitions.

## Demo

Demo is a product surface, not decoration.

Its frontend state model must be explicit.

Do not fake backend capability.

If backend endpoints do not support a state:
- implement an honest UI fallback only if the spec permits it
- otherwise mark the dependency and stop that subtask

Anonymous demo/gate state must not leak message text, email, phone, uploaded file names or private content into analytics.

## Content

Use exact approved copy from the specification where exact copy is defined.

Do not rewrite core positioning unless explicitly asked.

Do not add unsupported claims:
- "неотличим от человека"
- "100% точность"
- "никогда не ошибается"
- "полностью заменяет отдел продаж"
- guaranteed sales claims
- official integration/partner claims without proof

## Working protocol for every task

Before editing:
1. read the relevant spec section
2. inspect existing implementation
3. identify affected files
4. state the implementation plan internally
5. preserve existing working behavior

During implementation:
- make the smallest coherent change
- reuse existing healthy code
- do not refactor unrelated areas
- do not rename APIs
- do not install dependencies unless necessary
- if a new dependency is truly required, explain why before adding it

After implementation:
Run the repo's actual available checks, such as:
- typecheck
- lint
- tests
- build

Do not invent commands. Read `package.json` and repo documentation first.

Then inspect:
- git diff
- accidental backend changes
- accidental unrelated changes
- console errors where testable
- responsive risks
- accessibility risks

## Completion report

After every stage, return a compact report:

1. What you inspected
2. What you changed
3. Files changed
4. Verification commands and results
5. Visual/UX decisions
6. Risks or backend dependencies
7. Remaining work
8. Recommended next stage
9. Suggested checkpoint commit message

Do not begin the next large stage automatically.
