import type {ReactNode} from 'react';
import type {MarketingRouteId} from '../config/routes';
import {Container} from '../components/Container';
import {SiteHeader} from '../components/SiteHeader/SiteHeader';

// Page frame for the marketing surface: skip link, SiteHeader, main landmark, footer.
// The footer is still a placeholder until the Footer stage.
export function MarketingShell({currentRouteId, children}: {currentRouteId: MarketingRouteId; children: ReactNode}) {
  return (
    <div className="mk-root">
      <a className="mk-skip-link" href="#main">Перейти к содержанию</a>
      <SiteHeader currentRouteId={currentRouteId}/>
      <main id="main" tabIndex={-1}>{children}</main>
      <footer>
        <Container className="mk-shell-bar">
          <small>Scrooty</small>
        </Container>
      </footer>
    </div>
  );
}
