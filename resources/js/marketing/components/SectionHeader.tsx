import type {ReactNode} from 'react';
import {cx} from '../../shared/lib/cx';

/**
 * Eyebrow + title + description block.
 * level 1 renders the page H1 at Display L size (secondary pages); level 2 renders a section H2.
 * The homepage hero H1 (Display XL) is owned by the hero, not by this primitive.
 */
export function SectionHeader({id, level = 2, eyebrow, title, description, align = 'start'}: {
  id?: string;
  level?: 1 | 2;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: 'start' | 'center';
}) {
  const Heading = level === 1 ? 'h1' : 'h2';
  return (
    <div className={cx('mk-section-header', align === 'center' && 'mk-section-header--center')}>
      {eyebrow && <p className="mk-eyebrow mk-section-header__eyebrow">{eyebrow}</p>}
      <Heading id={id} className={level === 1 ? 'mk-display-l' : 'mk-h2'}>{title}</Heading>
      {description && <p className="mk-body-l mk-section-header__description">{description}</p>}
    </div>
  );
}
