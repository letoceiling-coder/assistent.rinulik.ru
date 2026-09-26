import '../../css/marketing/marketing.css';
import type {MarketingRoute} from './config/routes';
import {MarketingShell} from './layout/MarketingShell';
import {HomePage} from './pages/HomePage';
import {SkeletonPage} from './pages/SkeletonPage';

// Root of the public marketing surface. Loaded as a separate chunk by resources/js/app.tsx.
// Must not import anything from resources/js/product/.
export function MarketingApp({route}: {route: MarketingRoute}) {
  return (
    <MarketingShell currentRouteId={route.id}>
      {route.id === 'home' ? <HomePage/> : <SkeletonPage route={route}/>}
    </MarketingShell>
  );
}
