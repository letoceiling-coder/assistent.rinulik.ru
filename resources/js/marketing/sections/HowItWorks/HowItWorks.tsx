import {ButtonLink} from '../../components/Button/Button';
import {ChatMessage} from '../../components/ChatMessage/ChatMessage';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {homeAnchors} from '../../config/navigation';
import {routePath} from '../../config/routes';
import './HowItWorks.css';

const steps = [
  {title: 'Понимает', text: 'Разбирает, о чём спрашивает клиент, с учётом всего разговора.'},
  {title: 'Находит знания', text: 'Отвечает по материалам компании: прайсу, условиям, инструкциям.'},
  {title: 'Делает действие', text: 'Фиксирует заявку и собирает данные, которые нужны вашей команде.'},
  {title: 'Передаёт человеку', text: 'Подключает менеджера по вашим правилам — вместе с контекстом.'},
] as const;

/** Homepage Section 05 — how it works, in business language (spec §10). */
export function HowItWorks() {
  return (
    <Section id={homeAnchors.howItWorks.id} labelledBy="how-title" tone="surface">
      <div className="mk-split">
        <div>
          <SectionHeader
            id="how-title"
            eyebrow="КАК РАБОТАЕТ Scrooty"
            title="Понимает вопрос. Находит данные. Делает следующий шаг."
            description="Один разговор связывает знания компании, актуальные данные, нужное действие и менеджера."
          />
          <ol role="list" className="mk-how__steps">
            {steps.map((step, index) => (
              <li key={step.title} className="mk-how__step">
                <span className="mk-how__num" aria-hidden="true">{index + 1}</span>
                <div>
                  <h3 className="mk-how__title">{step.title}</h3>
                  <p className="mk-card__text">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mk-section-cta">
            <ButtonLink variant="secondary" href={routePath('integrations')}>Посмотреть возможности</ButtonLink>
            <p className="mk-microcopy">Модель остаётся внутри. Клиент видит только полезный разговор.</p>
          </div>
        </div>

        <figure className="mk-window mk-how__window">
          <div className="mk-window__bar">
            <span>Диалог</span>
            <span className="mk-window__caption">Иллюстрация</span>
          </div>
          <div className="mk-window__body mk-how__body">
            <ol role="list" className="mk-how__thread">
              <ChatMessage author="customer" text="Сколько идёт доставка в Екатеринбург?"/>
              <ChatMessage author="scrooty" text="По условиям доставки — 3–5 рабочих дней. Оформить заказ на ваш адрес?"/>
            </ol>
            <ul role="list" className="mk-how__markers" aria-label="Что произошло за этим ответом">
              <li><span className="mk-pill mk-pill--info mk-pill--plain">Знания</span> Ответ из документа «Условия доставки»</li>
              <li><span className="mk-pill mk-pill--available mk-pill--plain">Действие</span> Заявка сохранена в разделе «Лиды»</li>
              <li><span className="mk-pill mk-pill--soon mk-pill--plain">Человек</span> Менеджер подключится, если клиент попросит</li>
            </ul>
          </div>
          <figcaption className="mk-visually-hidden">Пример: ответ по базе знаний, созданная заявка и правило передачи менеджеру.</figcaption>
        </figure>
      </div>
    </Section>
  );
}
