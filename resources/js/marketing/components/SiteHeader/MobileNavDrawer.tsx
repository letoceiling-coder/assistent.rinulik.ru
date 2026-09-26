import {useEffect, useRef, useState} from 'react';
import {headerActions, isGroupActive, primaryNav} from '../../config/navigation';
import type {MarketingRouteId} from '../../config/routes';
import {cx} from '../../../shared/lib/cx';
import {ButtonLink} from '../Button/Button';
import {ChevronDownIcon, CloseIcon} from './icons';
import {Wordmark} from './Wordmark';

/**
 * Mobile navigation drawer on the native modal <dialog>:
 * showModal() gives focus containment, inert background, top-layer stacking and Escape (cancel) for free.
 * Scroll lock is pure CSS (html:has(.mk-drawer[open])), so nothing needs cleanup on close/unmount.
 */
export function MobileNavDrawer({id, open, currentRouteId, onClose}: {
  id: string;
  open: boolean;
  currentRouteId: MarketingRouteId;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    // Groups containing the current page start expanded.
    () => new Set(primaryNav.flatMap(e => (e.type === 'group' && isGroupActive(e, currentRouteId) ? [e.id] : []))),
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Unmounting while open (e.g. surface change in dev) must not leave a modal/scroll lock behind.
  useEffect(() => () => dialogRef.current?.close(), []);

  const toggleGroup = (groupId: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });

  return (
    // onClose fires for Escape (native cancel), the close button and navigation alike.
    <dialog ref={dialogRef} id={id} className="mk-drawer" aria-label="Меню" onClose={onClose}>
      <div className="mk-drawer__inner">
        <div className="mk-drawer__header">
          <Wordmark isCurrent={currentRouteId === 'home'} onNavigate={onClose}/>
          <button ref={closeButtonRef} type="button" className="mk-icon-button" aria-label="Закрыть меню" onClick={onClose}>
            <CloseIcon/>
          </button>
        </div>

        <nav aria-label="Основная навигация" className="mk-drawer__nav">
          <ul role="list" className="mk-drawer__list">
            {primaryNav.map(entry => {
              if (entry.type === 'link') {
                const current = entry.routeId === currentRouteId;
                return (
                  <li key={entry.href}>
                    <a className={cx('mk-drawer__link', current && 'is-active')} href={entry.href} aria-current={current ? 'page' : undefined} onClick={onClose}>
                      {entry.label}
                    </a>
                  </li>
                );
              }
              const isExpanded = expanded.has(entry.id);
              const panelId = `${id}-${entry.id}`;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={cx('mk-drawer__link', 'mk-drawer__group-trigger', isGroupActive(entry, currentRouteId) && 'is-active')}
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    onClick={() => toggleGroup(entry.id)}
                  >
                    {entry.label}
                    <ChevronDownIcon/>
                  </button>
                  <ul role="list" id={panelId} className="mk-drawer__sublist" hidden={!isExpanded}>
                    {entry.items.map(item => {
                      const current = item.routeId === currentRouteId;
                      return (
                        <li key={item.href}>
                          <a className={cx('mk-drawer__sublink', current && 'is-active')} href={item.href} aria-current={current ? 'page' : undefined} onClick={onClose}>
                            {item.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mk-drawer__actions">
          <ButtonLink variant="secondary" size="lg" fullWidth href={headerActions.login.href} onClick={onClose}>
            {headerActions.login.label}
          </ButtonLink>
          <ButtonLink variant="primary" size="lg" fullWidth href={headerActions.primary.href} onClick={onClose}>
            {headerActions.primary.label}
          </ButtonLink>
        </div>
      </div>
    </dialog>
  );
}
