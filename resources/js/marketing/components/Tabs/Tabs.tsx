import {useRef, type KeyboardEvent} from 'react';
import {cx} from '../../../shared/lib/cx';
import './Tabs.css';

export type TabItem<T extends string> = {id: T; label: string};

/** ids shared by a tab and its panel, so consumers can wire `tabPanelProps`. */
export const tabId = (prefix: string, id: string) => `${prefix}-tab-${id}`;
export const panelId = (prefix: string, id: string) => `${prefix}-panel-${id}`;

export function tabPanelProps(prefix: string, id: string) {
  return {id: panelId(prefix, id), role: 'tabpanel' as const, 'aria-labelledby': tabId(prefix, id), tabIndex: 0};
}

/**
 * WAI-ARIA tabs (automatic activation): roving tabindex, Arrow keys, Home/End.
 * `variant` only changes the look: underline row or segmented control.
 */
export function Tabs<T extends string>({label, idPrefix, items, value, onChange, variant = 'segmented', className}: {
  label: string;
  idPrefix: string;
  items: readonly TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  variant?: 'segmented' | 'underline';
  className?: string;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1;
    const next =
      event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    onChange(items[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div role="tablist" aria-label={label} className={cx('mk-tabs', `mk-tabs--${variant}`, className)}>
      {items.map((item, index) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            ref={el => { refs.current[index] = el; }}
            type="button"
            role="tab"
            id={tabId(idPrefix, item.id)}
            aria-controls={panelId(idPrefix, item.id)}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className="mk-tabs__tab"
            onClick={() => onChange(item.id)}
            onKeyDown={event => onKeyDown(event, index)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
