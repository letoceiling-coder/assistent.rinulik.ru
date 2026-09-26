import {ButtonLink} from '../../components/Button/Button';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {routePath} from '../../config/routes';
import {HERO_DEMO_ID} from '../Hero/Hero';
import './Trust.css';

/**
 * Trust built on what can be checked right now. No logos, reviews, counters or seats.
 * The approved body mentions a «живой ответ»; the demo is scenario-based until the anonymous demo API
 * exists, so the body says «демо-разговор» instead (docs/scrooty/frontend-backend-todo.md §1).
 */
const tiles = [
  {title: 'Демо-разговор', text: 'Задайте вопрос и посмотрите, как Scrooty ведёт диалог. Без регистрации.', href: `#${HERO_DEMO_ID}`, cta: 'Открыть демо'},
  {title: 'Настоящий интерфейс', text: 'Кабинет, в котором создаётся, обучается и проверяется менеджер.', href: '#cabinet', cta: 'Посмотреть кабинет'},
  {title: 'Честные статусы интеграций', text: 'Что доступно сейчас, а что готовится, — отмечено прямо на карточках.', href: routePath('integrations'), cta: 'Все интеграции'},
  {title: 'Прозрачные тарифы', text: 'Цены и лимиты опубликованы. 7 дней бесплатно без карты.', href: routePath('pricing'), cta: 'Тарифы'},
] as const;

/** Homepage Section 11 — trust (spec §10, §37). */
export function Trust() {
  return (
    <Section id="trust" labelledBy="trust-title" tone="surface">
      <SectionHeader
        id="trust-title"
        eyebrow="НЕ ОБЕЩАНИЕ. РАБОТАЮЩИЙ ПРОДУКТ."
        title="Проверьте Scrooty на своём вопросе."
        description="Посмотрите демо-разговор, интерфейс, доступные интеграции и прозрачные тарифы. Реальные кейсы появятся только с разрешения клиентов."
      />
      <ul role="list" className="mk-trust">
        {tiles.map(tile => (
          <li key={tile.title} className="mk-card mk-trust__tile">
            <h3 className="mk-trust__title">{tile.title}</h3>
            <p className="mk-card__text">{tile.text}</p>
            <ButtonLink variant="text" size="sm" href={tile.href}>{tile.cta}</ButtonLink>
          </li>
        ))}
      </ul>
    </Section>
  );
}
