// Public marketing routes owned by the marketing surface.
// Single source of truth for which paths render MarketingApp instead of the product app.
// Laravel's catch-all route serves the same SPA shell for all of these paths; there is no
// per-route server HTML/meta yet (see docs/scrooty/frontend-repo-audit.md, SEO/SERVER ROUTING DEPENDENCY).

export const marketingRoutes = [
  {id: 'home', path: '/'},
  {id: 'pricing', path: '/pricing'},
  {id: 'partners', path: '/partners'},
  {id: 'avito-ai', path: '/avito-ai'},
  {id: 'telegram-ai', path: '/telegram-ai'},
  {id: 'max-ai', path: '/max-ai'},
  {id: 'site-ai', path: '/site-ai'},
  {id: 'integrations', path: '/integrations'},
  {id: 'demo', path: '/demo'},
] as const;

export type MarketingRoute = (typeof marketingRoutes)[number];
export type MarketingRouteId = MarketingRoute['id'];

/** Path of a marketing route — use this instead of writing route URLs as strings in components. */
export function routePath(id: MarketingRouteId): string {
  const route = marketingRoutes.find(r => r.id === id);
  if (!route) throw new Error(`Unknown marketing route: ${id}`);
  return route.path;
}

/** Collapses trailing slashes so `/pricing/` and `/pricing` resolve to the same route. */
function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

export function matchMarketingRoute(pathname: string): MarketingRoute | null {
  const path = normalizePath(pathname);
  return marketingRoutes.find(route => route.path === path) ?? null;
}
