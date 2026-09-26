// Single typed source of truth for public pricing (spec §11, §35). Used by the homepage preview and /pricing.
// Overage prices are intentionally absent: billing rules are not finalized (docs/scrooty/frontend-backend-todo.md).

export type BillingPeriod = 'monthly' | 'annual';
export type PlanId = 'start' | 'business' | 'pro' | 'enterprise';

export type Plan = {
  id: PlanId;
  name: string;
  /** Rubles. null = individual pricing. */
  monthly: number | null;
  annual: number | null;
  popular?: boolean;
  tagline: string;
  limits: {
    dialogs: string;
    managers: string;
    channels: string;
    knowledgeBases: string;
    integrations: string;
    seats: string;
    support: string;
  };
};

export const plans: readonly Plan[] = [
  {
    id: 'start', name: 'Start', monthly: 2490, annual: 24900,
    tagline: 'Один канал и один AI-менеджер для первых сценариев.',
    limits: {dialogs: '150 диалогов в месяц', managers: '1 AI-менеджер', channels: '1 канал', knowledgeBases: '1 база знаний', integrations: 'Sheets или webhook', seats: '1 пользователь', support: 'Поддержка по email'},
  },
  {
    id: 'business', name: 'Business', monthly: 5990, annual: 59900, popular: true,
    tagline: 'Несколько каналов и менеджеров для растущего потока обращений.',
    limits: {dialogs: '600 диалогов в месяц', managers: '3 AI-менеджера', channels: '4 канала', knowledgeBases: '3 базы знаний', integrations: 'Стандартные интеграции', seats: '3 пользователя', support: 'Приоритетный чат'},
  },
  {
    id: 'pro', name: 'Pro', monthly: 13990, annual: 139900,
    tagline: 'Большой объём, API и помощь с запуском.',
    limits: {dialogs: '2 000 диалогов в месяц', managers: '10 AI-менеджеров', channels: '10 подключений', knowledgeBases: '10 баз знаний', integrations: 'Все стандартные + API', seats: '10 пользователей', support: 'Приоритет и ревью запуска'},
  },
  {
    id: 'enterprise', name: 'Enterprise', monthly: null, annual: null,
    tagline: 'Индивидуальные лимиты, интеграции и условия.',
    limits: {dialogs: 'Индивидуально', managers: 'Индивидуально', channels: 'Индивидуально', knowledgeBases: 'Индивидуально', integrations: 'Индивидуально', seats: 'Индивидуально', support: 'SLA'},
  },
];

export const limitLabels: Record<keyof Plan['limits'], string> = {
  dialogs: 'Диалоги',
  managers: 'AI-менеджеры',
  channels: 'Каналы',
  knowledgeBases: 'Базы знаний',
  integrations: 'Интеграции',
  seats: 'Пользователи',
  support: 'Поддержка',
};

const rub = new Intl.NumberFormat('ru-RU');
export const formatRub = (value: number) => `${rub.format(value)} ₽`;

/** Display model for one plan in a billing period. Derived — never stored. */
export function planPrice(plan: Plan, period: BillingPeriod) {
  if (plan.monthly === null || plan.annual === null) return {main: 'Индивидуально', unit: '', note: 'Условия обсуждаются отдельно'};
  if (period === 'monthly') return {main: formatRub(plan.monthly), unit: '/ месяц', note: `или ${formatRub(plan.annual)} за год`};
  return {main: formatRub(plan.annual), unit: '/ год', note: `≈ ${formatRub(Math.round(plan.annual / 12))} в месяц · 2 месяца в подарок`};
}

export const dialogDefinition = 'Диалог — переписка с одним клиентом в пределах 24 часов.';
export const trialNote = 'Во всех тарифах есть 7 дней бесплатно без карты.';
