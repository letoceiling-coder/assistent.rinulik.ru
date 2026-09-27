import {ChatMessage} from '../../components/ChatMessage/ChatMessage';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {homeAnchors} from '../../config/navigation';
import './Handoff.css';

/** Homepage — human handoff, shown not told. Example content; rules are configured per manager. */
export function Handoff() {
  return (
    <Section id={homeAnchors.handoff.id} labelledBy="handoff-title" tone="warm">
      <SectionHeader id="handoff-title" align="center" title="Человек подключается вовремя."/>

      <div className="mk-handoff">
        <figure className="mk-window mk-glass mk-glass--elevated mk-handoff__thread">
          <div className="mk-window__bar">
            <span>Диалог с клиентом</span>
            <span className="mk-window__caption">Пример</span>
          </div>
          <ol role="list" className="mk-window__body mk-handoff__messages">
            <ChatMessage author="customer" text="Сделаете смету на переговорную для 12 человек?"/>
            <ChatMessage author="scrooty" text="Да. Какой город и срок? Передам менеджеру с деталями."/>
            <ChatMessage author="customer" text="Москва, к концу месяца."/>
          </ol>
        </figure>

        <div className="mk-handoff__connector">
          <span className="mk-signal-line mk-handoff__line" aria-hidden="true" data-reveal="draw"/>
          <span className="mk-glass mk-handoff__pill">Нужна смета</span>
          <span className="mk-signal-line mk-handoff__line" aria-hidden="true" data-reveal="draw"/>
        </div>

        <article className="mk-window mk-handoff__summary" aria-label="Карточка для менеджера" data-reveal="scale-soft">
          <div className="mk-window__bar">
            <span>Передано менеджеру</span>
            <span className="mk-pill mk-pill--info mk-pill--plain">Новый</span>
          </div>
          <dl className="mk-window__body mk-handoff__facts">
            <div><dt>Запрос</dt><dd>Смета на переговорную, 12 человек</dd></div>
            <div><dt>Город</dt><dd>Москва</dd></div>
            <div><dt>Срок</dt><dd>К концу месяца</dd></div>
            <div><dt>Причина</dt><dd>Индивидуальный расчёт</dd></div>
          </dl>
        </article>
      </div>

    </Section>
  );
}
