import {routePath} from '../../config/routes';

/**
 * Text wordmark on Inter until the approved SVG wordmark exists (spec §39 asset checklist).
 * Swap the inner <span> for the real asset here; header layout does not depend on it.
 */
export function Wordmark({isCurrent, onNavigate}: {isCurrent: boolean; onNavigate?: () => void}) {
  return (
    <a className="mk-wordmark" href={routePath('home')} aria-current={isCurrent ? 'page' : undefined} onClick={onNavigate}>
      <span className="mk-wordmark__text">Scrooty</span>
    </a>
  );
}
