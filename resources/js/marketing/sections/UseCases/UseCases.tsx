import {ButtonLink} from '../../components/Button/Button';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {routePath} from '../../config/routes';
import './UseCases.css';

/** Scenario snippets: customer message → what Scrooty does → outcome. No industry results or metrics. */
const useCases = [
  {tone: 'peach', title: 'Продажи по объявлениям', message: '«Ещё актуально? Можно посмотреть завтра?»', action: 'Отвечает по данным объявления и уточняет удобное время.', outcome: 'Менеджер получает покупателя с понятным запросом.'},
  {tone: 'blue', title: 'Запись на услуги', message: '«Есть окно в субботу?»', action: 'Уточняет услугу, удобное время и контакт.', outcome: 'Заявка на запись с деталями — у администратора.'},
  {tone: 'mint', title: 'Интернет-магазин', message: '«Сколько идёт доставка в мой город?»', action: 'Отвечает по условиям доставки из базы знаний.', outcome: 'Клиент получает ответ сразу, без ожидания.'},
  {tone: 'butter', title: 'Заявки от компаний', message: '«Нужен счёт на 20 штук»', action: 'Собирает объём, реквизиты и контакт.', outcome: 'Менеджер начинает с готового контекста.'},
  {tone: 'periwinkle', title: 'Консультации и обучение', message: '«Какая программа мне подойдёт?»', action: 'Задаёт уточняющие вопросы по одному.', outcome: 'Эксперт подключается к подготовленному разговору.'},
  {tone: 'peach', title: 'Поддержка клиентов', message: '«Как вернуть товар?»', action: 'Отвечает по инструкции, а при нехватке данных передаёт человеку.', outcome: 'Команда разбирает только сложные случаи.'},
] as const;

/** Homepage Section 10 — use cases (spec §10). */
export function UseCases() {
  return (
    <Section id="use-cases" labelledBy="usecases-title" tone="canvas">
      <SectionHeader
        id="usecases-title"
        eyebrow="ГДЕ Scrooty ПОЛЕЗЕН СРАЗУ"
        title="Для бизнеса, где скорость ответа влияет на выбор."
        description="Начните с повторяющихся входящих вопросов и понятного следующего шага."
      />
      <ul role="list" className="mk-usecases" data-reveal-group>
        {useCases.map(item => (
          <li key={item.title} className="mk-usecase mk-lift" data-tone={item.tone} data-reveal="fade-up">
            <h3 className="mk-usecase__title">{item.title}</h3>
            <p className="mk-usecase__message"><span className="mk-visually-hidden">Клиент пишет: </span>{item.message}</p>
            <dl className="mk-usecase__flow">
              <div><dt>Scrooty</dt><dd>{item.action}</dd></div>
              <div><dt>Результат</dt><dd>{item.outcome}</dd></div>
            </dl>
          </li>
        ))}
      </ul>
      <div className="mk-section-cta">
        <ButtonLink variant="secondary" href={routePath('demo')}>Подобрать сценарий</ButtonLink>
      </div>
    </Section>
  );
}
