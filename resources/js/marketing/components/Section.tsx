import type {ReactNode} from 'react';
import {cx} from '../../shared/lib/cx';
import {Container} from './Container';

export type SectionTone = 'canvas' | 'surface' | 'soft';

/**
 * Major page section: full-bleed background, responsive vertical spacing (--section-space),
 * contained content. Pass `labelledBy` with the id of the SectionHeader title for an accessible name.
 */
export function Section({id, labelledBy, tone = 'canvas', className, children}: {
  id?: string;
  labelledBy?: string;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cx('mk-section', `mk-section--tone-${tone}`, className)}>
      <Container>{children}</Container>
    </section>
  );
}
