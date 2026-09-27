import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {typo} from '../../../shared/lib/typography';
import './UseCases.css';

/** Scenario snippets: customer message → segment → outcome. No industry results or metrics. */
const useCases = [
  {tone: 'peach', segment: 'Объявления', message: 'Ещё актуально? Можно завтра посмотреть?', outcome: 'Покупатель с понятным запросом'},
  {tone: 'blue', segment: 'Запись на услуги', message: 'Есть окно в субботу?', outcome: 'Заявка на запись с деталями'},
  {tone: 'mint', segment: 'Интернет-магазин', message: 'Сколько идёт доставка?', outcome: 'Ответ сразу, без ожидания'},
  {tone: 'butter', segment: 'B2B-заявки', message: 'Нужен счёт на 20 штук', outcome: 'Менеджер с готовым контекстом'},
  {tone: 'periwinkle', segment: 'Обучение', message: 'Какая программа мне подойдёт?', outcome: 'Эксперт на подготовленном разговоре'},
  {tone: 'peach', segment: 'Поддержка', message: 'Как вернуть товар?', outcome: 'Команда разбирает только сложное'},
] as const;

/** Homepage — use cases, compact: message → segment → outcome. */
export function UseCases() {
  return (
    <Section id="use-cases" labelledBy="usecases-title" tone="canvas">
      <SectionHeader id="usecases-title" align="center" title="Подходит там, где важно ответить сразу."/>
      <ul role="list" className="mk-usecases">
        {useCases.map(item => (
          <li key={item.segment} className="mk-usecase" data-tone={item.tone}>
            <p className="mk-usecase__message"><span className="mk-visually-hidden">Клиент пишет: </span>{item.message}</p>
            <h3 className="mk-usecase__segment">{item.segment}</h3>
            <p className="mk-usecase__outcome"><span aria-hidden="true">→ </span>{typo(item.outcome)}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
