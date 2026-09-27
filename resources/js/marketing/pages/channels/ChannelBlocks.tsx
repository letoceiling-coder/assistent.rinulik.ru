// Building blocks shared by the channel and product landing pages. Pages compose them differently —
// each page owns its copy and order, so pages are not clones with a swapped channel name.
import type {ReactNode} from 'react';
import {ButtonLink} from '../../components/Button/Button';
import {ChatMessage} from '../../components/ChatMessage/ChatMessage';
import {Section, type SectionTone} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {channelById, statusLabel, type ChannelId} from '../../config/integrations';
import {productLinks} from '../../config/navigation';
import {formatRub, plans, trialNote} from '../../config/pricing';
import {routePath} from '../../config/routes';
import type {ChatMessageData} from '../../demo/types';
import {typo} from '../../../shared/lib/typography';
import './ChannelBlocks.css';

export function ChannelStatus({id}: {id: ChannelId}) {
  const channel = channelById(id);
  return (
    <p className="mk-status-note">
      <span className={`mk-pill mk-pill--${channel.status}`}>{statusLabel[channel.status]}</span>
      <span>{channel.note}</span>
    </p>
  );
}

export function ChatPreview({title, caption = 'Пример диалога', messages}: {title: string; caption?: string; messages: readonly Omit<ChatMessageData, 'id'>[]}) {
  return (
    <figure className="mk-window">
      <div className="mk-window__bar">
        <span>{title}</span>
        <span className="mk-window__caption">{caption}</span>
      </div>
      <ol role="list" className="mk-window__body mk-chat-preview">
        {messages.map((m, i) => <ChatMessage key={i} author={m.author} text={m.text}/>)}
      </ol>
    </figure>
  );
}

export function CardGrid({id, eyebrow, title, description, items, tone, columns = 3}: {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  items: ReadonlyArray<{title: string; text: string; tag?: ReactNode}>;
  tone?: SectionTone;
  columns?: 2 | 3 | 4;
}) {
  return (
    <Section id={id} labelledBy={`${id}-title`} tone={tone}>
      <SectionHeader id={`${id}-title`} eyebrow={eyebrow} title={title} description={description}/>
      <ul role="list" className={`mk-card-grid mk-card-grid--${columns}`}>
        {items.map(item => (
          <li key={item.title} className="mk-card mk-card-grid__item">
            {item.tag}
            <h3 className="mk-card-grid__title">{typo(item.title)}</h3>
            <p className="mk-card__text">{typo(item.text)}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function StepsSection({id, eyebrow, title, steps, note, tone, aside}: {
  id: string;
  eyebrow?: string;
  title: string;
  steps: readonly string[];
  note?: string;
  tone?: SectionTone;
  aside?: ReactNode;
}) {
  return (
    <Section id={id} labelledBy={`${id}-title`} tone={tone}>
      <div className="mk-split">
        <div>
          <SectionHeader id={`${id}-title`} eyebrow={eyebrow} title={title}/>
          <ol role="list" className="mk-steps">
            {steps.map(step => <li key={step}><span>{typo(step)}</span></li>)}
          </ol>
          {note && <p className="mk-microcopy mk-steps-note">{note}</p>}
        </div>
        {aside}
      </div>
    </Section>
  );
}

/** Split section: copy on one side, any visual on the other. */
export function SplitSection({id, eyebrow, title, description, children, visual, tone, reverse}: {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  visual: ReactNode;
  tone?: SectionTone;
  reverse?: boolean;
}) {
  return (
    <Section id={id} labelledBy={`${id}-title`} tone={tone}>
      <div className={reverse ? 'mk-split mk-split--reverse' : 'mk-split'}>
        <div>
          <SectionHeader id={`${id}-title`} eyebrow={eyebrow} title={title} description={description}/>
          {children}
        </div>
        {visual}
      </div>
    </Section>
  );
}

export function PricingTeaser({tone}: {tone?: SectionTone}) {
  const start = plans[0];
  return (
    <Section id="pricing-teaser" labelledBy="pricing-teaser-title" tone={tone}>
      <div className="mk-pricing-teaser">
        <div>
          <h2 id="pricing-teaser-title" className="mk-h3">Тарифы от {formatRub(start.monthly!)} в месяц</h2>
          <p className="mk-card__text">{trialNote} Один тариф покрывает все подключённые каналы в пределах лимитов.</p>
        </div>
        <div className="mk-pricing-teaser__actions">
          <ButtonLink variant="secondary" href={routePath('pricing')}>Сравнить тарифы</ButtonLink>
          <ButtonLink variant="text" href={productLinks.register}>Создать аккаунт</ButtonLink>
        </div>
      </div>
    </Section>
  );
}
