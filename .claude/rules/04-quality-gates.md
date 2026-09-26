---
description: Scrooty frontend verification, accessibility, performance and QA gates
---

# Quality Gates

A stage is not complete because it "looks done".

It is complete only when implementation and checks pass.

## Required checks

Use the repository's actual scripts.

Inspect `package.json` before running commands.

Run the relevant available checks:
- typecheck
- lint
- unit/component tests
- build

If a script does not exist, report that. Do not invent it.

## Visual QA sizes

Check:
- 360
- 375
- 390
- 430
- 768
- 1024
- 1280
- 1440

## Accessibility QA

Verify:
- one H1
- semantic heading order
- keyboard operation
- visible focus
- no focused control hidden behind sticky header/drawer
- mobile touch targets
- labels
- error text connection
- reduced motion
- no color-only meaning
- accessible tabs
- accessible accordions
- drawer/dialog focus behavior

## Performance QA

Watch:
- oversized hero assets
- unnecessary JS
- full admin bundle loaded on marketing routes
- layout shift from images/fonts
- long main-thread handlers
- animation libraries used for trivial transitions

Targets:
- LCP <= 2.5s
- CLS <= 0.1
- INP <= 200ms goal

## Content QA

Search for:
- ASSISTENT
- SCROOTY
- ScRooty
- fake client names
- fake metrics
- fake reviews
- unsupported integrations
- placeholder legal data
- unsupported MAX claims

## Diff QA

Before reporting completion:
- `git diff --check`
- review `git diff --stat`
- inspect changed file list
- confirm no backend files changed
