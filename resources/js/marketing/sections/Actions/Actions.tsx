import {ButtonLink} from '../../components/Button/Button';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {integrations, statusLabel, type IntegrationStatus} from '../../config/integrations';
import {homeAnchors} from '../../config/navigation';
import {routePath} from '../../config/routes';
import './Actions.css';

const byId = (id: string) => integrations.find(i => i.id === id)!;

/** Action outcomes. Built-in product capabilities first; integration statuses come from config/integrations.ts. */
const actions: ReadonlyArray<{title: string; text: string; status: IntegrationStatus}> = [
  {title: 'Создать лид', text: 'Заявка с контактом и сутью разговора появляется в разделе «Лиды».', status: 'available'},
  {title: 'Уведомить менеджера', text: 'Сообщение о новой заявке приходит сотруднику в Telegram.', status: 'available'},
  {title: 'Записать в таблицу', text: byId('google-sheets').job, status: byId('google-sheets').status},
  {title: 'Вызвать webhook', text: byId('webhook').job, status: byId('webhook').status},
  {title: 'Передать в CRM', text: byId('bitrix24').job, status: byId('bitrix24').status},
];

/** Homepage Section 07 — actions (spec §10). Only verified capabilities are marked available. */
export function Actions() {
  return (
    <Section id={homeAnchors.actions.id} labelledBy="actions-title" tone="surface">
      <SectionHeader
        id="actions-title"
        eyebrow="НЕ ТОЛЬКО ОТВЕЧАЕТ"
        title="Scrooty может сделать следующий шаг."
        description="Создать лид, записать данные в таблицу, вызвать webhook, передать контакт или уведомить менеджера."
      />

      <div className="mk-actions__flow">
        <div className="mk-actions__source mk-card mk-card--soft">
          <span className="mk-row__meta">Клиент в диалоге</span>
          <p>«Хочу записаться на пятницу. Оставлю номер для связи.»</p>
        </div>
        <span className="mk-actions__arrow" aria-hidden="true">→</span>
        <ul role="list" className="mk-actions__grid" aria-label="Что Scrooty может сделать дальше">
          {actions.map(action => (
            <li key={action.title} className="mk-card mk-actions__card">
              <span className={`mk-pill mk-pill--${action.status}`}>{statusLabel[action.status]}</span>
              <h3 className="mk-actions__title">{action.title}</h3>
              <p className="mk-card__text">{action.text}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mk-section-cta">
        <ButtonLink variant="secondary" href={routePath('integrations')}>Все интеграции</ButtonLink>
        <p className="mk-microcopy">Набор действий зависит от подключённой интеграции.</p>
      </div>
    </Section>
  );
}
