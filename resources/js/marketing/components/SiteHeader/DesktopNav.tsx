import {useCallback, useState} from 'react';
import {isGroupActive, primaryNav} from '../../config/navigation';
import type {MarketingRouteId} from '../../config/routes';
import {cx} from '../../../shared/lib/cx';
import {NavDropdown, type OpenSource} from './NavDropdown';

/** Desktop primary navigation. At most one dropdown is open at a time. */
export function DesktopNav({currentRouteId}: {currentRouteId: MarketingRouteId}) {
  const [open, setOpen] = useState<{id: string; source: OpenSource} | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <nav className="mk-header__nav" aria-label="Основная навигация">
      <ul role="list" className="mk-header__nav-list">
        {primaryNav.map(entry => (
          <li key={entry.type === 'group' ? entry.id : entry.href}>
            {entry.type === 'group' ? (
              <NavDropdown
                group={entry}
                open={open?.id === entry.id ? open.source : null}
                active={isGroupActive(entry, currentRouteId)}
                currentRouteId={currentRouteId}
                onOpen={source => setOpen({id: entry.id, source})}
                onClose={close}
              />
            ) : (
              <a
                className={cx('mk-nav-link', entry.routeId === currentRouteId && 'is-active')}
                href={entry.href}
                aria-current={entry.routeId === currentRouteId ? 'page' : undefined}
              >
                {entry.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
