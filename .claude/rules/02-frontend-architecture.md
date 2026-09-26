---
description: React/TypeScript architecture rules for Scrooty marketing frontend
paths:
  - "resources/js/**"
  - "resources/css/**"
  - "src/**"
  - "frontend/**"
---

# Frontend Architecture

Inspect actual paths before editing. The path list above is illustrative and may need adjustment to the repository.

## Architectural priorities

1. Preserve existing healthy architecture.
2. Separate marketing from authenticated product shell where possible.
3. Keep shared primitives reusable and domain-neutral.
4. Keep page sections composable.
5. Keep repeated content/config typed and centralized.
6. Keep interaction state minimal and local unless multiple distant components genuinely share it.

## Suggested conceptual structure

```text
frontend/
  marketing/
    pages/
    sections/
    components/
    config/
  product/
  shared/
    ui/
    hooks/
    lib/
    types/
  styles/
    tokens
    reset
    typography
```

Do not force this exact tree if the repository already has a coherent equivalent.

## Component rules

A component should usually have one clear reason to change.

Prefer:
- `SiteHeader`
- `MarketingShell`
- `SectionHeader`
- `Button`
- `DemoShell`
- `ChatMessage`
- `ChannelTabs`
- `ProductWindow`
- `PricingCard`
- `Accordion`
- `Footer`

Avoid:
- giant page components
- page-specific styling hidden in generic primitives
- generic components with dozens of boolean props
- unnecessary wrapper components
- repeated markup with small copy differences when typed config is enough

## State rules

Do not store derived data in state.

Avoid duplicated sources of truth.

Examples:
- pricing plan data belongs in one config
- active plan ID may be state
- selected plan object should be derived from the ID
- demo state should be modeled explicitly rather than with contradictory booleans

Prefer discriminated unions for multi-state UI when useful.

Example conceptual shape:

```ts
type DemoStatus =
  | { type: 'idle' }
  | { type: 'sending' }
  | { type: 'typing' }
  | { type: 'complete' }
  | { type: 'soft-gate' }
  | { type: 'hard-gate' }
  | { type: 'error'; reason: DemoErrorReason }
```

Adapt to existing code. Do not refactor functioning code merely to match this example.

## Data/config rules

Centralize genuinely shared frontend data:
- routes
- navigation
- pricing display config
- channel metadata
- integration display statuses
- analytics event names

Do not move copy into a mega-config if it makes page editing harder.

## Dependency rule

Prefer zero new dependencies.

Before adding a package:
- verify equivalent capability does not already exist
- estimate bundle impact
- explain benefit
- keep dependency scope narrow
