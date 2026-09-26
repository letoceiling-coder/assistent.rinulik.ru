# Scrooty frontend — repo audit (Stage 0)

Дата: 2026-09-27. Ветка: `feat/scrooty-marketing-frontend-v1` (создана от `scrooty` @ `4b5b054`, рабочее дерево было чистым).
Цель: зафиксировать фактическую архитектуру перед реализацией `SCROOTY_LANDING_SPEC.md`. Продуктовая логика и backend не менялись.

---

## 1. Stack и версии (из `package.json` / `package-lock.json`)

| Что | Факт |
|---|---|
| Runtime / backend | Laravel 12, PHP ^8.2 (prod image `php:8.3-fpm`), PostgreSQL 16 + pgvector, Redis |
| Frontend | React 19.3.0 + TypeScript (SPA, без Inertia) |
| Bundler | Vite 6.4.3 + `laravel-vite-plugin` 1.3.0 + `@vitejs/plugin-react` 4.7.0 |
| TypeScript | **7.0.2** (native/Go-порт `tsc`), `strict: true`, `noEmit`, `moduleResolution: Bundler`, include только `resources/js/**/*.{ts,tsx}` |
| Package manager | **npm** (`package-lock.json`, Dockerfile делает `npm ci`); Node 22 в Docker, локально Node 22.22 / npm 10.9 |
| Иконки | `lucide-react` 1.48.0 (единственная runtime-зависимость кроме React) |
| Tailwind | `tailwindcss` 4 + `@tailwindcss/vite` в devDependencies, **но не подключены** (нет в `vite.config.js`, нет `@import "tailwindcss"`) — мёртвая зависимость |
| axios | подключается только в `resources/js/bootstrap.js` ← `app.js`, которые **не являются** entry Vite — мёртвый код |

Vite entries (`vite.config.js`): `resources/css/app.css`, `resources/js/app.tsx`. Одного бандла на всё.

## 2. Architecture map

```text
Browser ──► shared gateway nginx (host) ──► scrooty-web (nginx, deploy/nginx.conf)
                                              ├─ static: public/build/* (Vite output), favicon, robots
                                              └─ всё остальное → public/index.php → Laravel (scrooty-app php-fpm)
Laravel routes/web.php
  ├─ POST /webhooks/*                      (backend, каналы)
  ├─ /api/v1/*                             (JSON API, session + CSRF, same-origin)
  ├─ GET /login, /reset-password/{token}   → view('app')
  └─ GET /{path?} (кроме api/ и webhooks/) → view('app')   ← SPA catch-all
resources/views/app.blade.php  — единственный HTML-shell: <div id="root">, csrf meta,
                                 захардкоженные title/description "ASSISTENT", @vite(app.css, app.tsx)
resources/js/app.tsx (~69 KB, 89 очень длинных строк) — ВСЁ приложение:
  Auth (login/register/forgot/reset), App shell (sidebar+topbar), все кабинетные
  страницы, админка, модалки, чат-тест. Примитивы Badge/Button/Field/Empty/Modal внутри.
resources/js/api.ts — fetch-клиент `/api/v1/*` (+ money/date форматтеры)
resources/css/app.css (~27 KB, 8 строк minified-стиля) — все стили продукта
```

Сборка/деплой: `deploy/Dockerfile` (stage `frontend`: `npm ci && npm run build` → `public/build`), `compose.yaml` (project `scrooty`). `deploy/scrooty/deploy.sh` на сервере делает `git reset --hard origin/scrooty` — **прод деплоится из ветки `scrooty`**, наша feature-ветка на прод не влияет, пока её не смёржат (мёрж/пуш — только по явной команде).

## 3. Route map

### 3.1 Что реально отдаёт `/` и публичные пути сейчас

Любой не-API путь → `view('app')` → `App` делает `GET /api/v1/me`:
- аноним → компонент `Auth` (login-экран «ASSISTENT … Ваш бизнес. Всегда на связи.»); `/register` → режим регистрации; `/reset-password/{token}` → сброс пароля;
- авторизованный → кабинет, страница = `location.pathname.split('/')[2]` (т.е. `/app/<page>`), для `/` → dashboard.

Итого: **публичного маркетингового сайта нет**. `/` — это логин, SEO-контента нет, title/description одинаковые для всех URL.

### 3.2 Кабинет (auth/product routes, клиентский роутинг)

`/app/dashboard | assistants | knowledge | conversations | leads | integrations | wallet | usage | settings`
Админ: `/app/admin | users | routing | health | audit`.

### 3.3 Routing mechanism

Самописный: `useState(page)` + `history.pushState('/app/'+p)` в `go()` + `popstate` listener. Роутер-библиотеки нет. Для маркетинга не расширять этот механизм — нужен отдельный маленький path→page резолвер (см. §8).

### 3.4 Spec routes vs текущие

| Spec route | Сейчас | Комментарий |
|---|---|---|
| `/` | Auth/Dashboard | нужно развести маркетинг и кабинет |
| `/pricing`, `/partners`, `/avito-ai`, `/telegram-ai`, `/max-ai`, `/site-ai`, `/integrations`, `/demo`, `/privacy`, `/personal-data`, `/terms`, `/requisites` | нет (catch-all отдаст SPA → login) | уже доходят до `view('app')` без изменения backend |
| `/login` | есть (named route `login`, используется auth-middleware redirect) | путь не менять |
| `/signup` | нет; регистрация живёт на `/register` | `/register` не ломать (ссылки/письма); `/signup` можно добавить как клиентский алиас |
| `/reset-password/{token}` | есть (ссылка из письма, named `password.reset`) | не менять |

## 4. Frontend/backend boundary

### API client
Единственная точка: `resources/js/api.ts` → `fetch('/api/v1/'+path)`, `credentials: same-origin`, `X-CSRF-TOKEN` из `<meta name="csrf-token">`, 419 → «Сессия истекла». Ответ ошибок — Laravel `errors`/`message`. Контракты, используемые маркетингом:
- `POST /api/v1/register` — `name`, `email`, `password`, **`password_confirmation` обязателен** (`confirmed`), пароль min 8 + буквы + цифры. Throttle `auth`.
- `POST /api/v1/login` — `email`, `password`.
- `POST /api/v1/forgot-password`, `POST /api/v1/reset-password` (token, email, password, password_confirmation).
- `GET /api/v1/csrf` — обновление токена после логина/регистрации.
- `GET /api/v1/me`.

### Backend dependencies (не решать на фронте)
1. **Анонимного демо-эндпоинта нет.** Все conversation-роуты под `auth`; тест-чат работает через `POST assistants/{id}/test` → `POST conversations/{id}/messages` (202, очередь) → polling `GET conversations/{id}` раз в 3 с. Spec §18/§21 (4 анонимных сообщения, soft/hard gate, daily limit, safety refusal, перенос диалога в signup) требует нового backend-контракта. До его появления — только сценарный демо без сетевых вызовов, если spec это допускает, либо остановка подзадачи.
2. **SEO / meaningful initial HTML (spec §32).** HTML-shell один (`app.blade.php`), title/meta статичны, контент рендерится только клиентом. Варианты: (a) per-path meta в Blade-шаблоне без изменения routes; (b) отдельный marketing Blade/entry — потребует изменения `routes/web.php`; (c) пре-рендер в `public/` не заработает без правки nginx (`index index.php`, `try_files $uri $uri/`). (b)/(c) — backend/infra, нужен явный запрос владельца. Даже (a) — Blade = серверный шаблон; согласовать до Stage 17.
3. **Sitemap, canonical, noindex для auth, OG** — требуют (a)/(b) выше; `public/robots.txt` сейчас `Disallow:` (всё разрешено).
4. **Partner application form** (`partner_application_submitted`) — эндпоинта нет.
5. Onboarding после signup (spec §19) — существующий backend создаёт аккаунт и 500 ₽ бонус; шаги онбординга как отдельный API не существуют.
6. Юр. данные (`/requisites`, `/privacy`…) — контента в репозитории нет, не выдумывать.

## 5. Styling, UI, assets, analytics, SEO — текущее состояние

- **CSS:** один глобальный plain-CSS файл, minified в ~8 строк, классы без неймспейса (`.button`, `.brand`, `.auth`, `.stat`, `.footer`, `.modal`…), токенов почти нет (`--green`, `--muted`, `--line`, `--paper`), зелёная палитра, `font-size: 14px` на `:root`, брейкпоинты 767/900/1190/1500. Есть `prefers-reduced-motion`. Тема не совпадает со spec (ivory/orange/Inter). **Риск коллизий** глобальных классов с маркетинговыми.
- **Fonts:** Golos Text через render-blocking `@import` Google Fonts в `app.css`. Spec требует Inter. Self-hosted шрифтов нет.
- **Shared UI:** `Badge`, `Button`, `Field`, `Empty`, `Modal` — внутри `app.tsx`, не экспортируются, заточены под кабинет. Для маркетинга переиспользовать нечего, кроме `api.ts`.
- **Assets:** `public/favicon.ico` — **0 байт**; маскота, OG-картинок, логотипа, скриншотов продукта в репо нет. Логотип сейчас — текст «ASSISTENT» + CSS-знак.
- **Analytics:** отсутствует полностью (нет Метрики/gtag/dataLayer).
- **SEO/meta:** только статичный `<title>ASSISTENT — AI для вашего бизнеса</title>` и description в `app.blade.php`; `lang="ru"` есть.
- **Naming debt:** «ASSISTENT» в `app.tsx` (5 вхождений), `app.blade.php`, README, `config/assistent.php`, Docker/DB-именах. Во фронтенде менять можно; в backend/infra-именах — нет.
- **A11y в текущем SPA:** частично (`role="alert"`, 15 `aria-*`, focus-visible outline); на auth-экране `<h1>` в story-панели и `<h2>` у формы.
- **Existing demo/chat code:** только кабинетный тест-чат в `App` (polling 3 с, `request_id` uuid). Для публичного демо не пригоден (требует auth и созданного ассистента).
- **welcome.blade.php** — дефолтный Laravel, нигде не используется.

## 6. Scripts to verify work

| Проверка | Команда | Baseline (до изменений) |
|---|---|---|
| Install | `npm ci` | ok, 137 пакетов, 0 vulnerabilities |
| Build | `npm run build` (`vite build`) | **ok**, 2.2 s; `app.js` 312.46 kB (gzip 92.24 kB), `app.css` 27.29 kB (gzip 6.86 kB) |
| Typecheck | `npx --no-install tsc -p tsconfig.json --noEmit` | **ok**, 0 ошибок (npm-скрипта нет) |
| Lint | — | **нет** (ESLint/Prettier не установлены) |
| JS/component tests | — | **нет** (Vitest/Jest/Testing Library не установлены) |
| PHP tests (регресс-гард backend) | `composer install` + `APP_KEY=base64:… php vendor/bin/phpunit` | 16 tests, **1 pre-existing failure** (`PlatformTest::test_no_knowledge_does_not_invent_and_lead_is_unique`: ожидает «нет точных данных», движок отвечает уточняющим вопросом) + 1 risky. Не связано с фронтом, не чинить в этой ветке. |
| Dev server | `npm run dev` (нужен Laravel: `php artisan serve` или `composer dev`, `.env` + БД) | не запускался |
| Diff QA | `git diff --check`, `git diff --stat`, проверка что не тронуты backend-пути | — |

Если понадобятся `typecheck`/`test`/`lint` скрипты — добавлять только в `package.json` scripts/devDependencies отдельным согласованным шагом.

## 7. Safe file areas

**Можно менять (frontend):**
- `resources/js/**` — новый код в `resources/js/marketing/`, `resources/js/shared/`; `app.tsx` — только минимальная точка ветвления marketing/product (и замена текста «ASSISTENT» по отдельной задаче).
- `resources/css/**` — новые `tokens.css`, `reset.css`, `typography.css`, `marketing.css`; `app.css` — не рефакторить, только изоляция при необходимости.
- `public/` — новые статические ассеты (favicon, OG, шрифты, маскот) — **не** `public/index.php`, `.htaccess`.
- `vite.config.js`, `tsconfig.json`, `package.json` — только фронтовые правки (entries, scripts, devDeps) с обоснованием.
- `docs/scrooty/**`.

**Серая зона (только по явному согласованию):**
- `resources/views/app.blade.php` — серверный шаблон; нужен для per-route meta/SSR-подобного HTML и для Inter preload.
- `public/robots.txt`, sitemap.

**Не трогать (backend/infra):**
`app/**`, `routes/**`, `config/**`, `database/**`, `bootstrap/**`, `lang/**`, `tests/**` (PHP), `composer.*`, `compose.yaml`, `deploy/**`, `.env*`, `artisan`, `phpunit.xml`, `public/index.php`, `public/.htaccess`.

## 7a. Stage 01 — marketing/product boundary (реализовано)

> Разделы 2–3 описывают состояние **до** Stage 01. Текущее состояние — здесь.

```text
app.blade.php  (не менялся: @vite(['resources/css/app.css','resources/js/app.tsx']))
  └─ resources/js/app.tsx            ← bootstrap entry: единственный createRoot
       ├─ surface.ts                 ← resolveSurface(location.pathname)
       │    └─ marketing/config/routes.ts   (типизированный список marketing-путей)
       ├─ html[data-surface="marketing"|"product"]
       ├─ import('./marketing/MarketingApp')  → chunk MarketingApp-*.js + MarketingApp-*.css
       │    ├─ marketing/layout/MarketingShell.tsx  (skip link, header/main/footer placeholders)
       │    ├─ marketing/pages/SkeletonPage.tsx     (H1 "Scrooty" + dev marker)
       │    └─ css/marketing/marketing.css          (mk-* классы, html[data-surface=marketing])
       └─ import('./product/ProductApp')      → chunk ProductApp-*.js (+ lucide-react)
            └─ бывший app.tsx, перенесён git mv; 3 строки изменены (убран createRoot, путь к ../api, export)
resources/js/api.ts  — shared API-клиент, остался на месте (пока используется только product)
```

Правило выбора: marketing — только пути из `marketing/config/routes.ts` (`/`, `/pricing`, `/partners`, `/avito-ai`, `/telegram-ai`, `/max-ai`, `/site-ai`, `/integrations`, `/demo`, с нормализацией trailing slash). Всё остальное (`/login`, `/register`, `/reset-password/*`, `/app/*`, неизвестные пути) — product, поведение как до разделения.

Изменение поведения: `/` теперь marketing и для анонима (раньше — логин), и для авторизованного (раньше — dashboard). Вход — `/login` (существующий backend route), кабинет — `/app/*`.

Build после Stage 01: entry `app-*.js` 225.7 kB (gzip 70.4) = react + react-dom + bootstrap; `ProductApp-*.js` 88.7 kB (gzip 23.1); `MarketingApp-*.js` 0.8 kB + css 0.5 kB. Marketing-посетитель не грузит ProductApp/lucide.

Остаток связности: `resources/css/app.css` (27 kB, Golos Text `@import`) по-прежнему подключается Blade на всех страницах, включая marketing. Marketing CSS нейтрализует его глобальные правила через `html[data-surface="marketing"]` и `mk-` префикс. Полностью убрать product CSS с marketing можно одной правкой Blade (`@vite(['resources/js/app.tsx'])` + `import '../../css/app.css'` в ProductApp + убрать css из `vite.config.js` input) — это серая зона (серверный шаблон), требует согласования.

## 7b. SEO/SERVER ROUTING DEPENDENCY (blocker)

**Факт:** Laravel catch-all (`routes/web.php`) отдаёт один и тот же `view('app')` с HTTP 200 для любого не-API пути: одинаковые `<title>`/description («ASSISTENT…»), пустой `<div id="root">`, нет canonical/OG/robots meta, нет 404 для неизвестных путей. Marketing-пути уже открываются прямой загрузкой, но только как client-rendered SPA.

**Можно сделать frontend-only:**
- клиентский `document.title` / meta description / canonical из `marketing/config/routes.ts` (видно JS-краулерам, не видно в initial HTML);
- клиентский 404-экран для неизвестных marketing-путей (HTTP статус останется 200);
- семантическая разметка, внутренние ссылки, `robots.txt`/`sitemap.xml` как статические файлы в `public/` (sitemap без server-side генерации).

**Невозможно корректно без backend:**
- meaningful initial HTML (SSR/prerender) на marketing-маршрутах (spec §32);
- уникальные title/description/canonical/OG в HTML-ответе сервера;
- `noindex` для auth-страниц в HTML/заголовках;
- реальный HTTP 404 для неизвестных путей;
- отдача пре-рендеренных `public/<route>/index.html`: nginx (`deploy/nginx.conf`) использует `index index.php` и `try_files $uri $uri/ /index.php`, поэтому статический html по такому пути не будет отдан без правки infra.

**Минимальный backend contract (на будущее, отдельной задачей):**
1. Laravel передаёт в шаблон route meta для текущего пути: `title`, `description`, `canonical` (absolute), `robots` (`index|noindex`), `og:image`; источник — общий конфиг, синхронизированный с `marketing/config/routes.ts` (например, JSON, генерируемый/читаемый обеими сторонами).
2. Для marketing-путей — отдельный Blade layout с `@vite` только marketing entry и meaningful HTML (prerender-вывод или серверный фрагмент), для остальных — текущий `app.blade.php`.
3. Неизвестные не-API пути вне product-префиксов (`/app/*`, `/login`, `/register`, `/reset-password/*`) → HTTP 404 с marketing 404-страницей.
4. `sitemap.xml` из того же route-конфига; `noindex` для `/login`, `/register`, `/reset-password/*`, `/app/*`.

## 8. Risks / architectural debt (зафиксировано, не исправлялось)

1. Монолитный `app.tsx` (69 KB, all-in-one state ~25 useState) — маркетинг нельзя встраивать внутрь `App`.
2. Маркетинг-посетитель сейчас грузит весь кабинетный бандл (312 KB) и делает `GET /me` до рендера — противоречит performance-целям spec.
3. Глобальный CSS без неймспейсов + `:root{font-size:14px}` → конфликт с новой типографикой, если грузить оба CSS на одной странице.
4. Нет lint/tests → регрессии ловятся только `tsc` + build + ручной QA.
5. Только клиентский рендер → SEO-требования spec недостижимы без согласованного серверного шага.
6. Анонимное демо без backend-контракта невозможно честно.
7. Мёртвые зависимости: tailwindcss, @tailwindcss/vite, axios, `app.js`/`bootstrap.js`, `welcome.blade.php`.
8. `favicon.ico` пустой; render-blocking Google Fonts `@import`.
9. `assistent-deploy.tgz` (244 KB) и десятки diag/test-скриптов в `deploy/` закоммичены в репо.
10. Pre-existing падающий PHP-тест.
11. `/register` vs spec `/signup`; регистрация требует `password_confirmation` → в spec §19 поле 4 «Повторите пароль» **обязательно** (backend реально требует).

## 9. Recommended implementation path

1. **Stage 1 — tokens/base CSS:** `resources/css/tokens.css`, `reset.css`, `typography.css`, `marketing.css` под Soft Signal Premium; Inter self-hosted (woff2 в `public/fonts` или через npm-пакет шрифта — согласовать). Не трогать `app.css`.
2. **Stage 2 — разделение marketing/product без backend** (выполнено как Stage 01, см. §7a):
   - Отдельный Vite entry `resources/js/marketing/main.tsx` + `resources/css/marketing.css`; `app.tsx` остаётся для `/app/*`, `/login`, `/register`, `/reset-password/*`.
   - Выбор entry: либо тонкий bootstrap-entry, который по `location.pathname` делает `import()` нужного приложения (чистый фронт, code-split, кабинетный CSS/JS не грузится на маркетинге), либо per-path `@vite` в Blade (серая зона). Рекомендую первый вариант как стартовый — не требует правок backend.
   - Маленький типизированный route config `resources/js/marketing/config/routes.ts` (path, title, description, h1, robots) — один источник для навигации, `document.title`/meta на клиенте и будущего SSR/meta-шага.
   - Никаких изменений `routes/web.php`: catch-all уже отдаёт `view('app')` для всех spec-путей.
3. **Stage 3+** — по порядку spec §40 (header → hero → demo …). Demo: сначала UI state machine (discriminated union) с честным сценарным fallback; живой анонимный режим — после появления backend-контракта (§4 п.1).
4. **SEO (Stage 17)** — заранее вынести решение по §4 п.2 владельцу: минимально-инвазивный вариант — per-path meta в `app.blade.php` из общего конфига; полноценный meaningful HTML — отдельная backend/infra-задача.
5. Опционально (согласовать): добавить `"typecheck": "tsc -p tsconfig.json --noEmit"` в scripts; Vitest + Testing Library для demo state machine.

Проверка каждого шага: `npm run build`, `npx --no-install tsc -p tsconfig.json --noEmit`, `git diff --stat` (нет backend-путей), ручной QA на 360–1440.
