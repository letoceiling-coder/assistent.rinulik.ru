# Scrooty marketing frontend — backend TODO

Frontend-only work cannot close these items. Each entry: CURRENT / DESIRED CONTRACT / WHY / FRONTEND FALLBACK.
Backend was not changed on the `feat/scrooty-marketing-frontend-v1` branch.

## 1. Anonymous demo API

- **CURRENT:** every conversation endpoint requires auth (`/api/v1/assistants/{id}/test`, `/api/v1/conversations/*`). Replies are produced asynchronously by a queue worker and polled every 3 s.
- **DESIRED CONTRACT:** `POST /api/v1/demo/sessions` → `{session_id, expires_at, remaining}`; `POST /api/v1/demo/sessions/{id}/messages` `{text, scenario?, request_id}` → `{type: "answer", text} | {type: "refusal"} | {type: "daily_limit"} | {type: "session_expired"}` (sync or with a short poll). Server-side limit of 4 messages per anonymous session and a daily per-IP/device limit; throttling; no PII logging.
- **WHY:** spec demo = real product answers without registration.
- **FRONTEND FALLBACK (shipped):** `resources/js/marketing/demo/transport.ts` → `sandboxTransport` answers from prepared scenario texts (no network). UI labels it «Демо на готовых сценариях», answers carry «Пример ответа», unmatched questions get an honest note. A backend adapter only needs to implement `DemoTransport.send()`; the state machine (`useDemoSession`) and gates already handle `refusal`, `daily-limit`, `session-expired` and network errors.

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
- **FRONTEND FALLBACK (shipped):** legal routes are not invented; footer shows these entries as «готовится» without links; no placeholder legal entity data.

## 8. Channel / integration reality

- **CURRENT (product code):** channels Telegram, Avito, MAX (+ webhooks); Telegram notifications for leads. No Bitrix24 / Google Sheets / public API / site widget modules in the repository.
- **DESIRED:** confirmation of launch status for site widget, Bitrix24, Google Sheets, webhook actions and public API.
- **FRONTEND FALLBACK (shipped):** integration statuses are centralized in `resources/js/marketing/config/integrations.ts`; items without verified implementation are labelled «В планах» or «По запросу», never «Доступно».
