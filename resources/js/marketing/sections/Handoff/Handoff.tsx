import {ButtonLink} from '../../components/Button/Button';
import {ChatMessage} from '../../components/ChatMessage/ChatMessage';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {homeAnchors} from '../../config/navigation';
import {routePath} from '../../config/routes';
import mascotUrl from '../../../../images/marketing/scrooty-mascot.webp';
import './Handoff.css';

/** Homepage Section 08 — human handoff (spec §10). Example content; rules are configured per manager. */
export function Handoff() {
  return (
    <Section id={homeAnchors.handoff.id} labelledBy="handoff-title">
      <SectionHeader
        id="handoff-title"
        eyebrow="ЧЕЛОВЕК ПОДКЛЮЧАЕТСЯ ВОВРЕМЯ"
        title="Scrooty отвечает сам. Менеджер включается там, где действительно нужен."
        description="Scrooty распознаёт заданные условия передачи и отправляет сотруднику не просто уведомление, а готовый контекст разговора."
      />

      <div className="mk-handoff">
        <figure className="mk-window mk-handoff__thread">
          <div className="mk-window__bar">
            <span>Диалог с клиентом</span>
            <span className="mk-window__caption">Пример</span>
          </div>
          <ol role="list" className="mk-window__body mk-handoff__messages">
            <ChatMessage author="customer" text="Нужно оборудовать переговорную на 12 человек. Сделаете смету?"/>
            <ChatMessage author="scrooty" text="Да, поможем. Подскажите город и к какому сроку нужно — передам запрос менеджеру вместе с деталями."/>
            <ChatMessage author="customer" text="Москва, к концу месяца."/>
          </ol>
        </figure>

        <div className="mk-handoff__connector">
          <img className="mk-handoff__mascot" src={mascotUrl} alt="" width={64} height={64} loading="lazy" decoding="async"/>
          <span className="mk-pill mk-pill--plain mk-handoff__pill">Условие: запрос сметы</span>
          <span className="mk-handoff__line" aria-hidden="true"/>
        </div>

        <article className="mk-window mk-handoff__summary" aria-label="Карточка для менеджера">
          <div className="mk-window__bar">
            <span>Передано менеджеру</span>
            <span className="mk-pill mk-pill--info mk-pill--plain">Новый</span>
          </div>
          <dl className="mk-window__body mk-handoff__facts">
            <div><dt>Запрос</dt><dd>Оборудование переговорной на 12 человек, нужна смета</dd></div>
            <div><dt>Город</dt><dd>Москва</dd></div>
            <div><dt>Срок</dt><dd>К концу месяца</dd></div>
            <div><dt>Причина передачи</dt><dd>Клиент просит индивидуальный расчёт</dd></div>
          </dl>
        </article>
      </div>

      <div className="mk-section-cta">
        <ButtonLink variant="secondary" href={`${routePath('demo')}?scenario=handoff`}>Посмотреть сценарий</ButtonLink>
        <p className="mk-microcopy">Правила передачи задаются отдельно для каждого AI-менеджера.</p>
      </div>
    </Section>
  );
}
