// Single source of truth for channel and integration display statuses.
// Statuses reflect the product code in this repository (Sept 2026):
//  - Telegram and MAX channel adapters exist (app/Services/Messaging).
//  - Avito adapter is not available yet: the backend requires Avito Messenger API access.
//  - No site widget, Bitrix24, Google Sheets, outgoing webhook actions or public API in the codebase.
//  - Leads and lead notifications to Telegram exist.
// Never mark something `available` without a working implementation.
import type {MarketingRouteId} from './routes';

export type IntegrationStatus = 'available' | 'soon' | 'planned';

export const statusLabel: Record<IntegrationStatus, string> = {
  available: 'Доступно',
  soon: 'Готовится к запуску',
  planned: 'В планах',
};

export type ChannelId = 'avito' | 'telegram' | 'max' | 'site';

export type Channel = {
  id: ChannelId;
  name: string;
  routeId: MarketingRouteId;
  status: IntegrationStatus;
  /** Honest condition shown next to the status. */
  note: string;
};

export const channels: readonly Channel[] = [
  {id: 'avito', name: 'Avito', routeId: 'avito-ai', status: 'soon', note: 'Подключение появится после подтверждения доступа к API сообщений Avito.'},
  {id: 'telegram', name: 'Telegram', routeId: 'telegram-ai', status: 'available', note: 'Подключается токеном вашего Telegram-бота.'},
  {id: 'max', name: 'MAX', routeId: 'max-ai', status: 'available', note: 'Нужен подтверждённый профиль бизнеса и модерация бота в MAX.'},
  {id: 'site', name: 'Сайт', routeId: 'site-ai', status: 'soon', note: 'Виджет для сайта готовится к запуску.'},
];

export const channelById = (id: ChannelId): Channel => channels.find(c => c.id === id)!;

export type Integration = {
  id: string;
  name: string;
  job: string;
  status: IntegrationStatus;
  direction: string;
  setup: string;
};

/** Launch cards for /integrations (spec §17), statuses from product reality above. */
export const integrations: readonly Integration[] = [
  {id: 'telegram', name: 'Telegram', job: 'Отвечает клиентам в вашем Telegram-боте и присылает уведомления о новых обращениях.', status: 'available', direction: 'Сообщения: чтение и ответ', setup: 'Токен бота'},
  {id: 'max', name: 'MAX', job: 'Ведёт диалоги в бизнес-боте MAX.', status: 'available', direction: 'Сообщения: чтение и ответ', setup: 'Профиль бизнеса и модерация бота'},
  {id: 'avito', name: 'Avito', job: 'Отвечает на сообщения по объявлениям.', status: 'soon', direction: 'Сообщения: чтение и ответ', setup: 'Доступ к API сообщений Avito'},
  {id: 'webhook', name: 'Webhook', job: 'Передаёт лид и данные разговора в вашу систему.', status: 'soon', direction: 'Отправка данных', setup: 'URL обработчика'},
  {id: 'google-sheets', name: 'Google Sheets', job: 'Записывает заявки строками в таблицу.', status: 'soon', direction: 'Запись', setup: 'Доступ к таблице'},
  {id: 'bitrix24', name: 'Bitrix24', job: 'Создаёт лид или сделку с контекстом разговора.', status: 'soon', direction: 'Запись', setup: 'Подключение портала'},
  {id: 'api', name: 'API', job: 'Даёт вашей системе доступ к диалогам и лидам.', status: 'planned', direction: 'Чтение и запись', setup: 'Ключ API'},
];

/** Roadmap only (spec §17). */
export const roadmapIntegrations: readonly string[] = ['amoCRM', '1С', 'VK', 'YCLIENTS', 'Системы онлайн-записи', 'Почта и helpdesk'];
