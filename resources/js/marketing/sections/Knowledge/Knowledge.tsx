import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {integrations, statusLabel, type IntegrationStatus} from '../../config/integrations';
import {homeAnchors} from '../../config/navigation';
import './Knowledge.css';

/** Document statuses mirror the product's knowledge base labels (Готово / Обрабатывается). */
const documents = [
  {name: 'Прайс-лист.pdf', status: 'available', label: 'Готово'},
  {name: 'Условия доставки.docx', status: 'available', label: 'Готово'},
  {name: 'Частые вопросы.md', status: 'processing', label: 'Обрабатывается'},
] as const;

const byId = (id: string) => integrations.find(i => i.id === id)!;

/** Built-in capabilities first; integration statuses come from config/integrations.ts (never marked available without code). */
const actions: ReadonlyArray<{title: string; status: IntegrationStatus}> = [
  {title: 'Создать лид', status: 'available'},
  {title: 'Уведомить в Telegram', status: 'available'},
  {title: 'Записать в таблицу', status: byId('google-sheets').status},
  {title: 'Вызвать webhook', status: byId('webhook').status},
  {title: 'Передать в CRM', status: byId('bitrix24').status},
];

/** Homepage — knowledge + actions in one screen: what Scrooty knows and what it can do next. */
export function Knowledge() {
  return (
    <Section id={homeAnchors.knowledge.id} labelledBy="knowledge-title" tone="cool">
      <SectionHeader id="knowledge-title" align="center" title="Знает ваш бизнес. И может сделать следующий шаг."/>

      <div className="mk-kb">
        <figure className="mk-window mk-glass mk-glass--elevated mk-kb__panel">
          <figcaption className="mk-kb__head">
            <h3 className="mk-kb__title">Знания</h3>
            <p className="mk-kb__text">Документы, прайс, FAQ и&nbsp;сайт.</p>
          </figcaption>
          <ul role="list" className="mk-kb__list" aria-label="Пример базы знаний">
            {documents.map(doc => (
              <li key={doc.name} className="mk-row">
                <span className="mk-row__title">{doc.name}</span>
                <span className={`mk-pill mk-pill--${doc.status}`}>{doc.label}</span>
              </li>
            ))}
          </ul>
        </figure>

        <figure id={homeAnchors.actions.id} className="mk-window mk-glass mk-glass--elevated mk-kb__panel">
          <figcaption className="mk-kb__head">
            <h3 className="mk-kb__title">Действия</h3>
            <p className="mk-kb__text">Заявка, уведомление, передача данных.</p>
          </figcaption>
          <ul role="list" className="mk-kb__list" aria-label="Действия после разговора">
            {actions.map(action => (
              <li key={action.title} className="mk-row">
                <span className="mk-row__title">{action.title}</span>
                <span className={`mk-pill mk-pill--${action.status}`}>{statusLabel[action.status]}</span>
              </li>
            ))}
          </ul>
        </figure>
      </div>
    </Section>
  );
}
