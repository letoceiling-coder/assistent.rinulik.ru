import {useCallback, useEffect, useRef, useState} from 'react';
import {headerActions} from '../../config/navigation';
import type {MarketingRouteId} from '../../config/routes';
import {ButtonLink} from '../Button/Button';
import {Container} from '../Container';
import {DesktopNav} from './DesktopNav';
import {MenuIcon} from './icons';
import {MobileNavDrawer} from './MobileNavDrawer';
import {Wordmark} from './Wordmark';
import './SiteHeader.css';

/** Keep in sync with the collapse breakpoint in SiteHeader.css. */
const DESKTOP_NAV_QUERY = '(min-width: 1120px)';
const DRAWER_ID = 'mk-mobile-nav';

/**
 * Sticky marketing header (spec §9, §10 Section 01, §22). Never auto-hides.
 * Transparent at the top of the page, translucent ivory surface once the page is scrolled.
 */
export function SiteHeader({currentRouteId}: {currentRouteId: MarketingRouteId}) {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 4);
    update();
    window.addEventListener('scroll', update, {passive: true});
    return () => window.removeEventListener('scroll', update);
  }, []);

  // The drawer only exists below the desktop breakpoint; close it if the viewport grows past it.
  useEffect(() => {
    if (!drawerOpen) return;
    const query = window.matchMedia(DESKTOP_NAV_QUERY);
    const onChange = () => query.matches && setDrawerOpen(false);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [drawerOpen]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    burgerRef.current?.focus();
  }, []);

  return (
    <header className="mk-header" data-scrolled={scrolled || undefined}>
      <Container className="mk-header__bar">
        <Wordmark isCurrent={currentRouteId === 'home'}/>

        <DesktopNav currentRouteId={currentRouteId}/>

        <div className="mk-header__actions">
          <ButtonLink variant="ghost" href={headerActions.login.href}>{headerActions.login.label}</ButtonLink>
          <ButtonLink
            variant="primary"
            href={headerActions.primary.href}
            aria-current={currentRouteId === headerActions.primary.routeId ? 'page' : undefined}
          >
            {headerActions.primary.label}
          </ButtonLink>
        </div>

        <div className="mk-header__compact">
          <ButtonLink variant="primary" href={headerActions.primary.href} aria-label={headerActions.primary.label}>
            {headerActions.primary.shortLabel}
          </ButtonLink>
          <button
            ref={burgerRef}
            type="button"
            className="mk-icon-button"
            aria-label="Открыть меню"
            aria-expanded={drawerOpen}
            aria-controls={DRAWER_ID}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon/>
          </button>
        </div>
      </Container>

      <MobileNavDrawer id={DRAWER_ID} open={drawerOpen} currentRouteId={currentRouteId} onClose={closeDrawer}/>
    </header>
  );
}
