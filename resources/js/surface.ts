import {matchMarketingRoute, type MarketingRoute} from './marketing/config/routes';

// Decides which application owns the current URL.
// Marketing owns only the explicit routes in marketing/config/routes.ts.
// Everything else (/login, /register, /reset-password/*, /app/*, unknown paths) stays with the
// existing product app, exactly as before the split.
export type Surface =
  | {type: 'marketing'; route: MarketingRoute}
  | {type: 'product'};

export function resolveSurface(pathname: string): Surface {
  const route = matchMarketingRoute(pathname);
  return route ? {type: 'marketing', route} : {type: 'product'};
}
