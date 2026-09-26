import {useState} from 'react';
import {ButtonLink} from '../../components/Button/Button';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {Tabs, tabPanelProps} from '../../components/Tabs/Tabs';
import {routePath} from '../../config/routes';
import './HumanProof.css';

type ScenarioId = 'first' | 'follow-up' | 'unknown' | 'handoff';

/**
 * Same customer message, two replies. The "usual bot" is a realistic scripted bot, not a strawman:
 * the difference is context, tone, length and the next question. Example content.
 */
const scenarios: ReadonlyArray<{id: ScenarioId; label: string; customer: string; context?: string; bot: string; scrooty: string; why: string}> = [
  {
    id: 'first',
    label: 'Первый ответ',
    customer: 'Сколько стоит доставка до Казани?',
    bot: 'Стоимость доставки зависит от региона и веса заказа. Подробнее — в разделе «Доставка» на сайте.',
    scrooty: 'Доставляем в Казань. Стоимость считается по весу — подскажите, что планируете заказать, и я сразу назову сумму.',
    why: 'Отвечает по существу и сразу ведёт к следующему шагу.',
  },
  {
    id: 'follow-up',
    label: 'Уточнение',
    context: 'Раньше в диалоге клиент спрашивал про угловой диван.',
    customer: 'А в сером цвете есть?',
    bot: 'Уточните, пожалуйста, о каком товаре идёт речь.',
    scrooty: 'Для углового дивана серый вариант есть в каталоге. Показать фото или сразу посчитать доставку в Казань?',
    why: 'Помнит контекст разговора и не заставляет повторять.',
  },
  {
    id: 'unknown',
    label: 'Не знает',
    customer: 'А можно оплатить частями?',
    bot: 'Да, конечно! Выберите удобный способ оплаты при оформлении.',
    scrooty: 'В материалах компании нет информации о рассрочке, не хочу вас ввести в заблуждение. Передам вопрос менеджеру — он ответит здесь же.',
    why: 'Не придумывает факты, которых нет в знаниях.',
  },
  {
    id: 'handoff',
    label: 'Передача',
    customer: 'Нужно 20 штук для офиса, выставите счёт на юрлицо?',
    bot: 'Для оптовых заказов оставьте заявку на сайте, с вами свяжутся.',
    scrooty: 'Да, подготовим счёт. Подскажите название компании и удобный контакт — передам менеджеру заказ целиком: 20 штук, счёт на юрлицо.',
    why: 'Собирает данные и передаёт менеджеру готовый контекст.',
  },
];

/** Homepage Section 04 — human proof (spec §10). */
export function HumanProof() {
  const [active, setActive] = useState<ScenarioId>('first');
  const scenario = scenarios.find(s => s.id === active)!;

  return (
    <Section id="human-proof" labelledBy="human-title">
      <SectionHeader
        id="human-title"
        eyebrow="SCROOTY HUMAN FIRST"
        title="Разговор, который не хочется закрыть."
        description="Scrooty отвечает коротко, помнит контекст и задаёт один уместный вопрос за раз. Если данных не хватает, не придумывает и подключает человека."
      />
      <Tabs label="Сценарий" idPrefix="human" items={scenarios.map(s => ({id: s.id, label: s.label}))} value={active} onChange={setActive}/>

      <div {...tabPanelProps('human', active)} className="mk-human__panel">
        <div className="mk-human__question">
          {scenario.context && <p className="mk-microcopy">{scenario.context}</p>}
          <p><span className="mk-human__label">Клиент</span> {scenario.customer}</p>
        </div>
        <div className="mk-human__compare">
          <article className="mk-card mk-card--soft mk-human__reply" aria-label="Ответ обычного бота">
            <h3 className="mk-human__who">Обычный бот</h3>
            <p>{scenario.bot}</p>
          </article>
          <article className="mk-card mk-human__reply mk-human__reply--scrooty" aria-label="Ответ Scrooty">
            <h3 className="mk-human__who">Scrooty</h3>
            <p>{scenario.scrooty}</p>
            <p className="mk-human__why">{scenario.why}</p>
          </article>
        </div>
      </div>

      <div className="mk-section-cta">
        <ButtonLink variant="secondary" href={routePath('demo')}>Проверить в демо</ButtonLink>
        <p className="mk-microcopy">Стиль, правила и границы ответа настраиваются под ваш бизнес.</p>
      </div>
    </Section>
  );
}
