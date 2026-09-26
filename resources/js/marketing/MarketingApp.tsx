import '../../css/marketing/marketing.css';
import type {ComponentType} from 'react';
import type {MarketingRoute, MarketingRouteId} from './config/routes';
import {DemoProvider} from './demo/DemoProvider';
import {MarketingShell} from './layout/MarketingShell';
import {DemoPage} from './pages/DemoPage';
import {HomePage} from './pages/HomePage';
import {IntegrationsPage} from './pages/IntegrationsPage';
import {PartnersPage} from './pages/PartnersPage';
import {PricingPage} from './pages/PricingPage';
import {AvitoPage} from './pages/channels/AvitoPage';
import {MaxPage} from './pages/channels/MaxPage';
import {SitePage} from './pages/channels/SitePage';
import {TelegramPage} from './pages/channels/TelegramPage';
import {usePageMeta} from './seo/usePageMeta';

/** One page component per launch route (config/routes.ts). */
const pages: Record<MarketingRouteId, ComponentType> = {
  home: HomePage,
  pricing: PricingPage,
  partners: PartnersPage,
  'avito-ai': AvitoPage,
  'telegram-ai': TelegramPage,
  'max-ai': MaxPage,
  'site-ai': SitePage,
  integrations: IntegrationsPage,
  demo: DemoPage,
};

// Root of the public marketing surface. Loaded as a separate chunk by resources/js/app.tsx.
// Must not import anything from resources/js/product/.
export function MarketingApp({route}: {route: MarketingRoute}) {
  usePageMeta(route);
  const Page = pages[route.id];
  return (
    <DemoProvider>
      <MarketingShell currentRouteId={route.id}>
        <Page/>
      </MarketingShell>
    </DemoProvider>
  );
}
