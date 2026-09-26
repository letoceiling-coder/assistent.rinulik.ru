---
description: Scrooty frontend scope, git safety and non-negotiables
---

# Scope and Git Rules

Work only on the Scrooty frontend/marketing implementation.

## Branch

Expected branch:
`feat/scrooty-marketing-frontend-v1`

Before any write:
- check current branch
- check `git status`
- preserve user changes

Never modify main/master directly.

Never automatically:
- reset
- clean
- stash
- discard changes
- force checkout
- rebase
- merge
- push

## Backend freeze

Do not modify backend code, data models, migrations, API contracts, auth server logic or billing server logic.

If the frontend depends on missing backend behavior:
1. document the missing contract
2. keep the frontend safe
3. stop that part
4. continue only with independent frontend work

## Product truth

`SCROOTY_LANDING_SPEC.md` is canonical.

Never invent:
- integrations
- statuses
- customer proof
- metrics
- legal data
- partner status
- backend capability
