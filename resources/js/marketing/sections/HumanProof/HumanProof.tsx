import {useState} from 'react';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {Tabs, tabPanelProps} from '../../components/Tabs/Tabs';
import {typo} from '../../../shared/lib/typography';
import './HumanProof.css';

type ScenarioId = 'first' | 'follow-up' | 'unknown' | 'handoff';

/**
 * Same customer message, two replies. The "usual bot" is a realistic scripted bot, not a strawman:
 * the difference is context, tone and the next question. Example content, kept short on purpose.
 */
const scenarios: ReadonlyArray<{id: ScenarioId; label: string; customer: string; bot: string; scrooty: string; why: string}> = [
  {
    id: 'first',
    label: 'Сразу',
    customer: 'Есть доставка в Казань?',
    bot: 'Информация о доставке находится на нашем сайте.',
    scrooty: 'Да. Напишите район или адрес — подскажу условия доставки.',
    why: 'Отвечает по существу',
  },
  {
    id: 'follow-up',
    label: 'Уточнил',
    customer: 'А в сером цвете есть?',
    bot: 'Уточните, пожалуйста, о каком товаре речь.',
    scrooty: 'Угловой диван есть в сером. Показать фото?',
    why: 'Помнит контекст',
  },
  {
    id: 'unknown',
    label: 'Не знает',
    customer: 'Можно оплатить частями?',
    bot: 'Да, конечно! Выберите способ оплаты при оформлении.',
    scrooty: 'Точно не знаю — уточню у менеджера и отвечу здесь же.',
    why: 'Не придумывает',
  },
  {
    id: 'handoff',
    label: 'Передал',
    customer: 'Выставите счёт на юрлицо? Нужно 20 штук.',
    bot: 'Оставьте заявку на сайте, с вами свяжутся.',
    scrooty: 'Да. Напишите название компании — передам менеджеру заказ целиком.',
    why: 'Передаёт с контекстом',
  },
];

/** Homepage — human proof: the same question, a scripted bot vs Scrooty. */
export function HumanProof() {
  const [active, setActive] = useState<ScenarioId>('first');
  const scenario = scenarios.find(s => s.id === active)!;

  return (
    <Section id="human-proof" labelledBy="human-title">
      <SectionHeader id="human-title" align="center" title="Не бот. Нормальный разговор."/>
      <div className="mk-human__tabs">
        <Tabs label="Ситуация" idPrefix="human" items={scenarios.map(s => ({id: s.id, label: s.label}))} value={active} onChange={setActive}/>
      </div>

      <div {...tabPanelProps('human', active)} className="mk-human__panel">
        <p className="mk-human__question"><span className="mk-visually-hidden">Клиент: </span>{scenario.customer}</p>
        <div className="mk-human__compare">
          <article className="mk-human__reply mk-human__reply--bot" aria-label="Ответ обычного бота">
            <h3 className="mk-human__who">Обычный бот</h3>
            <p>{scenario.bot}</p>
          </article>
          <article className="mk-human__reply mk-human__reply--scrooty" aria-label="Ответ Scrooty">
            <h3 className="mk-human__who">Scrooty</h3>
            <p>{typo(scenario.scrooty)}</p>
            <p className="mk-human__why">{scenario.why}</p>
          </article>
        </div>
      </div>
    </Section>
  );
}
