// Marketing navigation: single source of truth for header (desktop + mobile drawer) links and labels.
// URLs come from routes.ts / homeAnchors / productLinks — never hard-code hrefs in components.
import {ctaLabels} from './cta';
import {routePath, type MarketingRouteId} from './routes';

/**
 * Homepage section anchors used by navigation.
 * `planned`: the section does not exist yet — the link lands on the homepage top until the
 * corresponding homepage stage adds an element with this id. Switch to `live` when it ships.
 */
export const homeAnchors = {
  features: {id: 'features', status: 'live'},
  howItWorks: {id: 'how-it-works', status: 'live'},
  knowledge: {id: 'knowledge', status: 'live'},
  actions: {id: 'actions', status: 'live'},
  handoff: {id: 'handoff', status: 'live'},
} as const satisfies Record<string, {id: string; status: 'planned' | 'live'}>;

export type HomeAnchorKey = keyof typeof homeAnchors;

export function anchorHref(key: HomeAnchorKey): string {
  return `${routePath('home')}#${homeAnchors[key].id}`;
}

/** Paths owned by the product app (served by existing Laravel routes). Not marketing routes. */
export const productLinks = {
  login: '/login',
  /** Existing registration route. `/signup` does not exist on the backend (docs/scrooty/frontend-backend-todo.md). */
  register: '/register',
} as const;

export type NavLink = {
  label: string;
  href: string;
  /** Marketing route this link points to; drives aria-current="page". Absent for anchors/product links. */
  routeId?: MarketingRouteId;
};

export type NavGroup = {
  id: string;
  label: string;
  items: readonly NavLink[];
};

export type NavEntry = ({type: 'link'} & NavLink) | ({type: 'group'} & NavGroup);

const link = (label: string, routeId: MarketingRouteId): NavLink => ({label, href: routePath(routeId), routeId});

export const primaryNav: readonly NavEntry[] = [
  {
    type: 'group',
    id: 'features',
    label: 'Возможности',
    items: [
      {label: 'AI-менеджер', href: anchorHref('features')},
      {label: 'Как работает', href: anchorHref('howItWorks')},
      {label: 'Знания', href: anchorHref('knowledge')},
      {label: 'Действия', href: anchorHref('actions')},
      {label: 'Передача менеджеру', href: anchorHref('handoff')},
    ],
  },
  {
    type: 'group',
    id: 'solutions',
    label: 'Решения',
    items: [
      link('Avito', 'avito-ai'),
      link('Telegram', 'telegram-ai'),
      link('MAX', 'max-ai'),
      link('Сайт', 'site-ai'),
    ],
  },
  {type: 'link', ...link('Интеграции', 'integrations')},
  {type: 'link', ...link('Интеграторам', 'partners')},
  {type: 'link', ...link('Тарифы', 'pricing')},
];

export const headerActions = {
  login: {label: ctaLabels.login, href: productLinks.login},
  primary: {label: ctaLabels.tryFree, shortLabel: ctaLabels.tryFreeShort, href: routePath('demo'), routeId: 'demo'},
} as const;

export function isGroupActive(group: NavGroup, currentRouteId: MarketingRouteId): boolean {
  return group.items.some(item => item.routeId === currentRouteId);
}
