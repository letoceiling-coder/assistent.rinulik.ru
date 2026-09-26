import {useEffect, useRef, type FocusEvent, type KeyboardEvent} from 'react';
import type {NavGroup} from '../../config/navigation';
import type {MarketingRouteId} from '../../config/routes';
import {cx} from '../../../shared/lib/cx';
import {ChevronDownIcon} from './icons';

export type OpenSource = 'hover' | 'click' | 'keyboard';

const HOVER_CLOSE_DELAY_MS = 120;

/**
 * Disclosure-style dropdown (button + list of links), not an ARIA menu: site navigation links
 * keep native link semantics. Works with mouse hover, click/tap and keyboard.
 */
export function NavDropdown({group, open, active, currentRouteId, onOpen, onClose}: {
  group: NavGroup;
  open: OpenSource | null;
  active: boolean;
  currentRouteId: MarketingRouteId;
  onOpen: (source: OpenSource) => void;
  onClose: () => void;
}) {
  const panelId = `mk-nav-panel-${group.id}`;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const focusFirstOnOpen = useRef(false);
  const isOpen = open !== null;

  const links = () => Array.from(wrapperRef.current?.querySelectorAll<HTMLAnchorElement>('.mk-nav-dropdown__link') ?? []);

  // Keyboard open via ArrowDown moves focus into the panel (display toggles, so it is focusable right after commit).
  useEffect(() => {
    if (isOpen && focusFirstOnOpen.current) {
      focusFirstOnOpen.current = false;
      links()[0]?.focus();
    }
  }, [isOpen]);

  // Close on pointer down outside the dropdown.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen, onClose]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  function handleTriggerClick() {
    // A dropdown opened by hover stays open on click (the click "pins" it) instead of toggling shut.
    if (open === 'hover') onOpen('click');
    else if (isOpen) onClose();
    else onOpen('click');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      onClose();
      triggerRef.current?.focus();
      return;
    }
    const items = links();
    const index = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) {
        focusFirstOnOpen.current = true;
        onOpen('keyboard');
      } else {
        items[(index + 1) % items.length]?.focus();
      }
    } else if (event.key === 'ArrowUp' && isOpen) {
      event.preventDefault();
      items[index <= 0 ? items.length - 1 : index - 1]?.focus();
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (isOpen && !wrapperRef.current?.contains(event.relatedTarget as Node | null)) onClose();
  }

  return (
    <div
      ref={wrapperRef}
      className="mk-nav-dropdown"
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onPointerEnter={event => {
        if (event.pointerType !== 'mouse') return;
        window.clearTimeout(closeTimer.current);
        if (!isOpen) onOpen('hover');
      }}
      onPointerLeave={event => {
        if (event.pointerType !== 'mouse' || open !== 'hover') return;
        closeTimer.current = window.setTimeout(onClose, HOVER_CLOSE_DELAY_MS);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className={cx('mk-nav-link', 'mk-nav-dropdown__trigger', active && 'is-active')}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleTriggerClick}
      >
        {group.label}
        <ChevronDownIcon/>
      </button>
      <div id={panelId} className="mk-nav-dropdown__panel" data-open={isOpen || undefined}>
        <ul role="list" className="mk-nav-dropdown__list">
          {group.items.map(item => (
            <li key={item.href}>
              <a
                className="mk-nav-dropdown__link"
                href={item.href}
                aria-current={item.routeId && item.routeId === currentRouteId ? 'page' : undefined}
                onClick={onClose}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
