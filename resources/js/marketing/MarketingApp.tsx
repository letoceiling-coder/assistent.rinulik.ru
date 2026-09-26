import '../../css/marketing/marketing.css';
import type {MarketingRoute} from './config/routes';
import {MarketingShell} from './layout/MarketingShell';
import {SkeletonPage} from './pages/SkeletonPage';

// Root of the public marketing surface. Loaded as a separate chunk by resources/js/app.tsx.
// Must not import anything from resources/js/product/.
export function MarketingApp({route}: {route: MarketingRoute}) {
  return (
    <MarketingShell>
      <SkeletonPage route={route}/>
    </MarketingShell>
  );
}
