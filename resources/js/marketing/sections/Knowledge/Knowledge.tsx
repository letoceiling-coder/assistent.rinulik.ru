import {ButtonLink} from '../../components/Button/Button';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {anchorHref, homeAnchors, productLinks} from '../../config/navigation';
import './Knowledge.css';

/** Document statuses mirror the product's knowledge base labels (Готово / Обрабатывается / Ошибка). */
const documents = [
  {name: 'Прайс-лист.pdf', meta: 'PDF · база «Основная»', status: 'available', label: 'Готово'},
  {name: 'Условия доставки.docx', meta: 'DOCX · база «Основная»', status: 'available', label: 'Готово'},
  {name: 'Частые вопросы.md', meta: 'Markdown · база «Основная»', status: 'processing', label: 'Обрабатывается'},
  {name: 'Инструкция по возврату.txt', meta: 'Не удалось прочитать файл · можно повторить', status: 'error', label: 'Ошибка'},
] as const;

/** Homepage Section 06 — company knowledge (spec §10). */
export function Knowledge() {
  return (
    <Section id={homeAnchors.knowledge.id} labelledBy="knowledge-title">
      <div className="mk-split mk-split--reverse">
        <div>
          <SectionHeader
            id="knowledge-title"
            eyebrow="ЗНАНИЯ ВАШЕЙ КОМПАНИИ"
            title="Scrooty знает то, что знает ваша компания."
            description="Добавьте сайт, документы, инструкции, FAQ, прайс или таблицу. Scrooty использует эти материалы в ответах и не должен додумывать бизнес-факты."
          />
          <div className="mk-section-cta">
            <ButtonLink variant="secondary" href={productLinks.register}>Добавить базу знаний</ButtonLink>
            <ButtonLink variant="text" href={anchorHref('howItWorks')}>Как устроены знания</ButtonLink>
          </div>
          <p className="mk-microcopy mk-knowledge__micro">Поддерживаемые форматы уточняются в интерфейсе загрузки.</p>
        </div>

        <figure className="mk-window">
          <div className="mk-window__bar">
            <span>Базы знаний</span>
            <span className="mk-window__caption">Иллюстрация интерфейса</span>
          </div>
          <div className="mk-window__body">
            <div className="mk-knowledge__drop" aria-hidden="true">Перетащите документы или добавьте текст</div>
            <ul role="list" aria-label="Документы базы знаний">
              {documents.map(doc => (
                <li key={doc.name} className="mk-row">
                  <span className="mk-row__main">
                    <span className="mk-row__title">{doc.name}</span>
                    <span className="mk-row__meta">{doc.meta}</span>
                  </span>
                  <span className={`mk-pill mk-pill--${doc.status}`}>{doc.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <figcaption className="mk-visually-hidden">Пример списка документов со статусами обработки.</figcaption>
        </figure>
      </div>
    </Section>
  );
}
