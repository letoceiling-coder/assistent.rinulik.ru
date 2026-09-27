import type {ReactNode} from 'react';
import {cx} from '../../shared/lib/cx';
import {Container} from './Container';

/**
 * Section atmospheres (Soft Signal Premium 2.0):
 * canvas / surface / soft — clean; cool / warm / mixed — soft branded light fields; dark — graphite break.
 */
export type SectionTone = 'canvas' | 'surface' | 'soft' | 'cool' | 'warm' | 'mixed' | 'dark';
export type RevealVariant = 'fade-up' | 'fade' | 'scale-soft';

/**
 * Major page section: background atmosphere, responsive vertical spacing (--section-space), contained content.
 * `stage` renders the section as a rounded panel floating on the canvas (used for a few key transitions).
 * Pass `labelledBy` with the id of the SectionHeader title for an accessible name.
 */
export function Section({id, labelledBy, tone = 'canvas', stage = false, reveal = 'fade-up', className, backdrop, children}: {
  id?: string;
  labelledBy?: string;
  tone?: SectionTone;
  stage?: boolean;
  reveal?: RevealVariant | false;
  className?: string;
  /** Decorative layer(s) behind the content (aria-hidden by the caller). */
  backdrop?: ReactNode;
  children: ReactNode;
}) {
  const content = <Container>{children}</Container>;
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cx('mk-section', `mk-section--tone-${tone}`, stage && 'mk-stage', className)}
    >
      {backdrop}
      {reveal ? <div data-reveal={reveal}>{content}</div> : content}
    </section>
  );
}
