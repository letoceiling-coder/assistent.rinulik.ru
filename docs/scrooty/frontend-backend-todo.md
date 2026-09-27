# Scrooty marketing frontend — backend TODO

Frontend-only work cannot close these items. Each entry: CURRENT / DESIRED CONTRACT / WHY / FRONTEND FALLBACK.
Backend was not changed on the `feat/scrooty-marketing-frontend-v1` branch.

## 1. Anonymous demo API — DONE

- `POST /api/v1/demo/messages` (`app/Http/Controllers/DemoController.php`), public, CSRF-protected. Request `{messages: [{role: user|assistant, content}]}` (1–10, user ≤ 800 chars, last = user; `system` never accepted). Response `{reply, remaining}`; errors carry `reason`: 429 `rate_limited` / `daily_limit`, 403 `demo_limit`, 422 validation, 503 `unavailable`.
- Not billed to wallets, not stored in `ai_usage`, message text never logged (`OpenRouterGateway::demoChat`, `conversation` model assignment + fallback). System prompt: `app/Services/DemoPrompt.php`.
- Limits (`config/assistent.php` → `demo`, env): `DEMO_SESSION_LIMIT` 4 per session, `DEMO_PER_MINUTE_IP` 6, `DEMO_PER_DAY_IP` 30, `DEMO_DAILY_LIMIT` 1000 global/day, `DEMO_MAX_TOKENS` 400.
- Frontend: `resources/js/marketing/demo/transport.ts` (`liveTransport`).

## 2. Demo context → registration

- **CURRENT:** `POST /api/v1/register` accepts `name, email, password, password_confirmation` only.
- **DESIRED CONTRACT:** optional `demo_session_id` (and UTM/referrer) on register; backend attaches the anonymous conversation, scenario and a draft manager to the new account.
- **WHY:** spec hard gate promises the dialog is kept and a draft manager is created.
- **FRONTEND FALLBACK (shipped):** hard-gate body adapted to not claim the dialog is saved: «Создайте аккаунт и настройте своего менеджера на ваших данных. 7 дней теста, карта не нужна.» Demo session lives only in the visitor's `sessionStorage`.

## 3. `/signup` route

- **CURRENT:** registration UI is `/register` (product app). `/signup` is not a backend route; the catch-all would render the product app's login.
- **DESIRED CONTRACT:** `/signup` → same view as `/register` (or 301 to `/register`).
- **FRONTEND FALLBACK (shipped):** all marketing CTAs link to `/register`.

## 4. SEO / server-rendered marketing HTML

- **CURRENT:** one Blade shell for every path, static `<title>ASSISTENT — AI для вашего бизнеса</title>`, empty `#root`, HTTP 200 for unknown paths.
- **DESIRED CONTRACT:** Laravel renders per-route `<title>`, description, canonical, OG and robots from a shared route-meta config (mirror of `resources/js/marketing/config/seo.ts`), `noindex` for `/login`, `/register`, `/reset-password/*`, `/app/*`; sitemap.xml; 404 for unknown non-product paths; ideally prerendered/SSR marketing HTML.
- **FRONTEND FALLBACK (shipped):** client-side title/description/canonical/OG/robots per route and FAQ JSON-LD on pages with a visible FAQ (visible to JS-rendering crawlers only).

## 5. Partner application endpoint

- **CURRENT:** none.
- **DESIRED CONTRACT:** `POST /api/v1/partners/applications` `{name, company, contact, partner_type, clients_estimate, consent}` with spam protection.
- **FRONTEND FALLBACK (shipped):** partner CTAs lead to registration / contact; no form that pretends to submit.

## 6. Trial model

- **CURRENT:** registration credits a one-time wallet bonus (500 ₽); there is no subscription/trial entity and no plans matching Start/Business/Pro.
- **DESIRED CONTRACT:** 7-day trial + plans Start/Business/Pro/Enterprise with the published limits; billing periods monthly/annual.
- **WHY:** marketing copy (approved) states «7 дней бесплатно», pricing lists plans.
- **FRONTEND FALLBACK:** approved copy kept; plan CTAs go to `/register`. Needs product/billing confirmation before launch.

## 7. Legal & company data

- **CURRENT:** no legal documents, requisites, status page or contact channel in the repository.
- **DESIRED:** texts for Privacy, Personal data processing, Terms, Requisites (legal entity, INN, OGRN), support contact, service status URL.
- **FRONTEND FALLBACK (shipped):** legal routes are not invented; footer lists these documents without links with the note «Публикуются перед запуском»; no placeholder legal entity data.

## 8. Channel / integration reality

- **CURRENT (product code):** working channel adapters for Telegram and MAX (+ inbound webhooks); the Avito adapter throws «Канал ещё недоступен. Для Avito требуется подтверждение доступа к Messenger API». Leads + Telegram lead notifications exist. No Bitrix24 / Google Sheets / outgoing webhook actions / public API / site widget modules.
- **DESIRED:** confirmation of launch status for site widget, Bitrix24, Google Sheets, webhook actions and public API.
- **FRONTEND FALLBACK (shipped):** integration statuses are centralized in `resources/js/marketing/config/integrations.ts`; items without verified implementation are labelled «Готовится к запуску» or «В планах», never «Доступно».

## 9. Contact channel, help and service status

- **CURRENT:** no public support email/Telegram, help center or status page.
- **DESIRED:** one public contact channel (for Enterprise, «Обсудить свою систему», partner onboarding) and, later, a status page URL.
- **FRONTEND FALLBACK (shipped):** Enterprise and partner CTAs lead to `/register`; «Статус сервиса» / «Контакты» are not shown in the footer; «Обсудить свою систему» CTA omitted.

## 10. Favicon and brand icons

- **CURRENT:** `public/favicon.ico` is 0 bytes (shared with the product app); no approved square icon.
- **DESIRED:** approved favicon set (spec §39) — the approved logo is a wordmark, a square icon must come from the brand owner.
- **FRONTEND FALLBACK:** none; not invented.

## 11. Knowledge sources vs approved copy

- **CURRENT (product):** knowledge accepts PDF, DOC, DOCX, TXT, MD files and manual text. No website crawling or spreadsheet import.
- **Approved homepage copy** mentions «сайт … или таблицу» as sources; kept as approved, with the approved microcopy «Поддерживаемые форматы уточняются в интерфейсе загрузки». FAQ lists the real formats. Needs product confirmation or a copy change before launch.
