import {routePath} from '../../config/routes';
import logoUrl from '../../../../images/marketing/scrooty-logo.webp';

/** Intrinsic size of the optimized logo copy (332×96, cropped from the approved logo asset). */
const LOGO_RATIO = 332 / 96;

/**
 * Approved Scrooty logo linking home. Height is set by the caller via CSS (`--wordmark-height`);
 * width/height attributes reserve space so the logo never shifts layout.
 */
export function Wordmark({isCurrent, onNavigate, height = 32}: {isCurrent: boolean; onNavigate?: () => void; height?: number}) {
  return (
    <a className="mk-wordmark" href={routePath('home')} aria-current={isCurrent ? 'page' : undefined} onClick={onNavigate}>
      <img className="mk-wordmark__img" src={logoUrl} alt="Scrooty" width={Math.round(height * LOGO_RATIO)} height={height} decoding="async"/>
    </a>
  );
}
