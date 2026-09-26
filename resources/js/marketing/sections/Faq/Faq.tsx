import type {ReactNode} from 'react';
import {track} from '../../analytics/track';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import type {FaqItem} from '../../config/faq';
import './Faq.css';

/**
 * Accessible FAQ accordion on native <details>/<summary> (keyboard and screen-reader support built in).
 * Emits FAQPage JSON-LD only for the questions actually rendered here.
 */
export function Faq({id = 'faq', items, eyebrow = 'КОРОТКО О ГЛАВНОМ', title = 'Вопросы перед запуском.', aside, tone = 'canvas'}: {
  id?: string;
  items: readonly FaqItem[];
  eyebrow?: string;
  title?: string;
  aside?: ReactNode;
  tone?: 'canvas' | 'surface';
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({'@type': 'Question', name: item.question, acceptedAnswer: {'@type': 'Answer', text: item.answer}})),
  };

  return (
    <Section id={id} labelledBy={`${id}-title`} tone={tone}>
      <div className="mk-faq">
        <div>
          <SectionHeader id={`${id}-title`} eyebrow={eyebrow} title={title}/>
          {aside}
        </div>
        <div className="mk-faq__list">
          {items.map(item => (
            <details
              key={item.id}
              className="mk-faq__item"
              onToggle={event => {
                if ((event.currentTarget as HTMLDetailsElement).open) track('faq_opened', {question_id: item.id});
              }}
            >
              <summary className="mk-faq__question">
                <span>{item.question}</span>
                <span className="mk-faq__icon" aria-hidden="true"/>
              </summary>
              <p className="mk-faq__answer">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}/>
    </Section>
  );
}
