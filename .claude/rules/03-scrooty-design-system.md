---
description: Scrooty marketing visual system and interaction direction
---

# Scrooty Design System

## Brand direction

Style name:
Soft Signal Premium

Character:
- warm
- calm
- premium
- modern SaaS
- human
- product-led
- tactile without being toy-like

## Core colors

```css
--bg-canvas: #F7F5F1;
--bg-surface: #FFFFFF;
--bg-surface-soft: #F2EFE8;
--border-soft: rgba(29, 35, 48, 0.08);
--border-strong: rgba(29, 35, 48, 0.14);

--text-primary: #151922;
--text-secondary: #5E6472;
--text-muted: #8991A3;

--accent-orange: #F28A57;
--accent-orange-deep: #E86F37;
--accent-blue: #AECBF7;
--accent-periwinkle: #CDD8F8;
--accent-butter: #F4DE9D;
--accent-mint: #CAE4D1;
--accent-peach: #F5C7B1;
--success: #9AC8AA;

--color-action-primary: var(--accent-orange-deep);
--color-action-primary-hover: #D95F2B;

--gradient-action: linear-gradient(135deg, #F49A68 0%, #E86F37 100%);

--shadow-soft: 0 16px 40px rgba(20,24,32,.06);
--shadow-card: 0 10px 28px rgba(20,24,32,.05);
--shadow-hover: 0 18px 44px rgba(20,24,32,.09);
--shadow-header: 0 8px 24px rgba(20,24,32,.04);

--radius-xl: 28px;
--radius-lg: 22px;
--radius-md: 18px;
--radius-sm: 14px;
--radius-pill: 999px;
```

If equivalent tokens already exist, map to them instead of creating duplicates.

## Typography

Font:
Inter

Desktop:
- homepage display: 72px / .98 / ~650
- secondary display: 60px / 1.02 / ~650
- H2: 48px / 1.08 / ~620
- H3: 26px / 1.2 / 600
- body large: 20px / 1.55
- body: 16px / 1.6

Mobile:
- homepage display: 40–44px / 1.02
- secondary display: 38px / 1.05
- H2: 32px / 1.12
- H3: 22px / 1.25
- body large: 18px / 1.55
- body: 16px / 1.55

Use fluid sizing when it preserves these endpoints.

## Layout

Desktop >= 1280:
- max content width: 1360px
- gutters: 40px
- 12 columns
- 24px gap

Laptop 1024–1279:
- gutters: 32px
- 20px gap

Tablet 768–1023:
- 8 columns
- 16px gap

Mobile 360–767:
- 4 columns
- 12px gap
- 16px gutters
- 20px gutters at 390+ when visually appropriate

Default major section spacing:
- desktop ~112px
- tablet ~88px
- mobile ~72px

## Surface language

Use:
- subtle borders
- low-opacity shadows
- ivory/white layering
- soft signal panels
- product screenshots/windows
- structured whitespace
- readable card density

Avoid:
- dark cyber UI
- huge gradients
- glowing borders
- neon
- purple primary actions
- excessive glass blur
- tiny text
- heavy borders
- childish rounded-everything treatment

## CTA

Primary CTA:
warm orange

Primary CTAs should be visually rare enough to preserve hierarchy.

Do not place two equally dominant orange actions inside every section.

## Mascot

Mascot is a guide and brand signature.

Rules:
- calm reactions
- max one primary mascot instance per viewport
- hero desktop ~72–96px
- hero mobile ~48–64px
- never replace functional iconography
- never obstruct input, CTA or content
- do not put mascot in every card

## Motion

Motion is quiet and functional.

Never:
- bounce continuously
- loop attention effects
- use parallax for decoration
- follow cursor
- animate large backgrounds unnecessarily
