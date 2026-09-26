// Route metadata (spec §32). Applied client-side by usePageMeta; the same shape is the contract for a future
// server-side meta/SSR step (docs/scrooty/frontend-backend-todo.md §4).
import type {MarketingRouteId} from './routes';

export const SITE_ORIGIN = 'https://scrooty.ru';
export const OG_IMAGE = `${SITE_ORIGIN}/og/scrooty-og.png`;

export type PageMeta = {title: string; description: string; robots?: 'index,follow' | 'noindex,nofollow'};

export const pageMeta: Record<MarketingRouteId, PageMeta> = {
  home: {
    title: 'Scrooty — AI-менеджер для Avito, Telegram, MAX и сайта',
    description: 'Scrooty отвечает клиентам быстро и по-человечески: знает ваш бизнес, собирает нужные данные и передаёт менеджеру готовый контекст. 7 дней бесплатно.',
  },
  pricing: {
    title: 'Тарифы Scrooty — AI-менеджер для бизнеса от 2 490 ₽',
    description: 'Тарифы AI-менеджера Scrooty для Avito, Telegram, MAX и сайта. 7 дней бесплатно без карты. Понятные лимиты диалогов и интеграций.',
  },
  partners: {
    title: 'Партнёрская программа Scrooty для AI- и CRM-интеграторов',
    description: 'Внедряйте AI-менеджеров клиентам, оставляйте себе 100% стоимости настройки и получайте до 30% recurring commission Scrooty.',
  },
  'avito-ai': {
    title: 'AI-менеджер для Avito — отвечает клиентам 24/7 | Scrooty',
    description: 'Scrooty отвечает на сообщения по объявлениям, уточняет детали и передаёт менеджеру подготовленное обращение.',
  },
  'telegram-ai': {
    title: 'AI-менеджер для Telegram-бота и заявок | Scrooty',
    description: 'Подключите Telegram-бота к знаниям и действиям бизнеса: Scrooty ведёт первый разговор, команда подключается к важным случаям.',
  },
  'max-ai': {
    title: 'AI-менеджер для MAX — чат-бот для бизнеса | Scrooty',
    description: 'Scrooty в бизнес-боте MAX отвечает на вопросы, собирает данные и передаёт обращения сотрудникам.',
  },
  'site-ai': {
    title: 'AI-менеджер для сайта — отвечает и собирает заявки | Scrooty',
    description: 'AI-менеджер Scrooty на сайте отвечает по базе знаний, уточняет запрос, создаёт лид и передаёт разговор сотруднику.',
  },
  integrations: {
    title: 'Интеграции Scrooty — Bitrix24, Google Sheets, API и webhook',
    description: 'Каналы и интеграции Scrooty с честными статусами: что доступно сейчас и что готовится к запуску.',
  },
  demo: {
    title: 'Демо Scrooty — поговорите с AI-менеджером',
    description: 'Опишите свой бизнес или задайте вопрос о продукте. Первые четыре сообщения доступны без регистрации.',
  },
};
