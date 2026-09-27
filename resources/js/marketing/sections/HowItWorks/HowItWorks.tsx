import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {homeAnchors} from '../../config/navigation';
import './HowItWorks.css';

/** Four nodes on one signal path. Each node has its own brand accent (blue, periwinkle, butter, peach/mint). */
const steps = [
  {key: 'understand', title: 'Понимает', text: 'Читает вопрос с учётом диалога'},
  {key: 'knowledge', title: 'Находит', text: 'Берёт ответ из ваших материалов'},
  {key: 'action', title: 'Делает', text: 'Создаёт заявку и уведомляет вас'},
  {key: 'handoff', title: 'Передаёт', text: 'Зовёт менеджера, когда нужно'},
] as const;

/** Homepage — how it works: four short steps on one signal path. */
export function HowItWorks() {
  return (
    <Section id={homeAnchors.howItWorks.id} labelledBy="how-title" tone="mixed">
      <SectionHeader id="how-title" align="center" title="Понял. Нашёл. Сделал."/>

      <div className="mk-journey">
        <div className="mk-journey__line" aria-hidden="true" data-reveal="draw"><span className="mk-signal-line"/></div>
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

    </Section>
  );
}
