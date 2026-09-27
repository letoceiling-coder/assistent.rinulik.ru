import {ButtonLink} from '../../components/Button/Button';
import {ChatMessage} from '../../components/ChatMessage/ChatMessage';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {homeAnchors} from '../../config/navigation';
import {routePath} from '../../config/routes';
import './HowItWorks.css';

/** Four nodes on one signal path. Each node has its own brand accent (blue, periwinkle, butter, peach/mint). */
const steps = [
  {key: 'understand', title: 'Понимает', text: 'Разбирает, о чём спрашивает клиент, с учётом всего разговора.'},
  {key: 'knowledge', title: 'Находит знания', text: 'Отвечает по материалам компании: прайсу, условиям, инструкциям.'},
  {key: 'action', title: 'Делает действие', text: 'Фиксирует заявку и собирает данные, которые нужны вашей команде.'},
  {key: 'handoff', title: 'Передаёт человеку', text: 'Подключает менеджера по вашим правилам — вместе с контекстом.'},
] as const;

/** Homepage Section 05 — how it works as a visual journey, in business language (spec §10). */
export function HowItWorks() {
  return (
    <Section id={homeAnchors.howItWorks.id} labelledBy="how-title" tone="mixed">
      <SectionHeader
        id="how-title"
        eyebrow="Как работает Scrooty"
        title="Понимает вопрос. Находит данные. Делает следующий шаг."
        description="Один разговор связывает знания компании, актуальные данные, нужное действие и менеджера."
      />

      <div className="mk-journey">
        <div className="mk-journey__line" aria-hidden="true"><span className="mk-signal-line"/></div>
        <ol role="list" className="mk-journey__nodes" data-reveal-group>
        {steps.map((step, index) => (
          <li key={step.key} className="mk-journey__node" data-node={step.key} data-reveal="fade-up">
            <span className="mk-journey__dot" aria-hidden="true">{index + 1}</span>
            <h3 className="mk-journey__title">{step.title}</h3>
            <p className="mk-journey__text">{step.text}</p>
          </li>
        ))}
        </ol>
      </div>

      <figure className="mk-how__stage" data-reveal="scale-soft">
        <div className="mk-window mk-how__window">
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
              <li data-node="knowledge"><span className="mk-how__marker">Знания</span> Ответ из документа «Условия доставки»</li>
              <li data-node="action"><span className="mk-how__marker">Действие</span> Заявка сохранена в разделе «Лиды»</li>
              <li data-node="handoff"><span className="mk-how__marker">Человек</span> Менеджер подключится, если клиент попросит</li>
            </ul>
          </div>
        </div>
        <figcaption className="mk-visually-hidden">Пример: ответ по базе знаний, созданная заявка и правило передачи менеджеру.</figcaption>
      </figure>

      <div className="mk-section-cta">
        <ButtonLink variant="secondary" href={routePath('integrations')}>Посмотреть возможности</ButtonLink>
        <p className="mk-microcopy">Модель остаётся внутри. Клиент видит только полезный разговор.</p>
      </div>
    </Section>
  );
}
