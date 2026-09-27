import type {ReactNode} from 'react';
import type {MarketingRouteId} from '../config/routes';
import {SiteFooter} from '../components/SiteFooter/SiteFooter';
import {SiteHeader} from '../components/SiteHeader/SiteHeader';
import {useReveal} from '../motion/useReveal';

// Page frame for the marketing surface: skip link, SiteHeader, main landmark, SiteFooter.
export function MarketingShell({currentRouteId, children}: {currentRouteId: MarketingRouteId; children: ReactNode}) {
  useReveal(currentRouteId);
  return (
    <div className="mk-root">
      <a className="mk-skip-link" href="#main">Перейти к содержанию</a>
      <SiteHeader currentRouteId={currentRouteId}/>
      <main id="main" tabIndex={-1}>{children}</main>
      <SiteFooter isHome={currentRouteId === 'home'}/>
    </div>
  );
}
