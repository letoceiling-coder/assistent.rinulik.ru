import type {ReactNode} from 'react';
import {cx} from '../../../shared/lib/cx';
import {Container} from '../Container';
import './PageHero.css';

/**
 * Hero for secondary pages: eyebrow, the page H1 (Display L), body, actions and an optional visual.
 * The homepage hero is a separate section with its own composition.
 */
export function PageHero({eyebrow, title, body, actions, note, visual, narrow = false}: {
  eyebrow?: string;
  title: string;
  body: ReactNode;
  actions?: ReactNode;
  note?: ReactNode;
  visual?: ReactNode;
  narrow?: boolean;
}) {
  return (
    <section className={cx('mk-page-hero', visual ? 'mk-page-hero--split' : undefined, narrow && 'mk-page-hero--narrow')} aria-labelledby="page-title">
      <Container className="mk-page-hero__grid">
        <div className="mk-page-hero__copy">
          {eyebrow && <p className="mk-eyebrow mk-page-hero__eyebrow">{eyebrow}</p>}
          <h1 id="page-title" className="mk-display-l mk-page-hero__title">{title}</h1>
          <div className="mk-body-l mk-page-hero__body">{body}</div>
          {actions && <div className="mk-page-hero__actions">{actions}</div>}
          {note && <div className="mk-page-hero__note">{note}</div>}
        </div>
        {visual && <div className="mk-page-hero__visual">{visual}</div>}
      </Container>
    </section>
  );
}
