import {track} from '../analytics/track';
import {ButtonLink} from '../components/Button/Button';
import {PageHero} from '../components/PageHero/PageHero';
import {PartnerCalculator} from '../components/PartnerCalculator/PartnerCalculator';
import {Section} from '../components/Section';
import {SectionHeader} from '../components/SectionHeader';
import {partnerFaq} from '../config/faq';
import {productLinks} from '../config/navigation';
import {foundingCohort, partnerLevels, percent} from '../config/partners';
import {Faq} from '../sections/Faq/Faq';
import './channels/ChannelBlocks.css';

const ownership: ReadonlyArray<[string, string, string]> = [
  ['Продажа и объём работ', 'Да', 'Материалы'],
  ['Подписка', 'Рекомендует', 'Биллинг'],
  ['Настройка менеджера', 'Да', 'Инструменты'],
  ['Работоспособность и ошибки', 'Передаёт в Scrooty', 'Да'],
  ['Данные клиента', 'Сбор и проверка', 'Хранение и интерфейс'],
  ['Первая линия поддержки', 'С уровня Integrator', 'Для уровня Referral'],
  ['Комиссия', 'Получает', 'Считает и выплачивает'],
];

const startFlow = [
  'Зарегистрируйтесь в Scrooty.',
  'Создайте менеджера для клиента или отправьте клиенту ссылку.',
  'Добавьте знания и правила.',
  'Подключите канал.',
  'Протестируйте разговоры.',
  'Запустите и получайте recurring-комиссию.',
];

/**
 * /partners (spec §12). Economics from config/partners.ts. No income guarantees, no certification claims,
 * white label is roadmap. There is no partner application endpoint yet (docs/scrooty/frontend-backend-todo.md §5).
 */
export function PartnersPage() {
  const onCta = () => track('partner_cta_clicked', {surface: 'partners_page'});

  return (
    <>
      <PageHero
        eyebrow="ПАРТНЁРСКАЯ ПРОГРАММА Scrooty"
        title="Создавайте AI-менеджеров клиентам. Получайте доход каждый месяц."
        body={<p>Берите оплату за внедрение, настройку и сопровождение. Scrooty платит recurring commission за закреплённых клиентов, пока они пользуются сервисом.</p>}
        actions={<>
          <ButtonLink variant="primary" size="lg" href={productLinks.register} onClick={onCta}>Стать интегратором</ButtonLink>
          <ButtonLink variant="secondary" size="lg" href="#calculator">Посчитать доход</ButtonLink>
        </>}
        note="Подключение к партнёрской программе — после регистрации аккаунта."
      />

      <Section id="economics" labelledBy="economics-title" tone="cool">
        <SectionHeader id="economics-title" eyebrow="ЭКОНОМИКА" title="Внедрение оплачивает вашу работу. Recurring создаёт предсказуемый доход."/>
        <ul role="list" className="mk-card-grid mk-card-grid--3">
          <li className="mk-card mk-card-grid__item"><h3 className="mk-card-grid__title">100% стоимости внедрения остаётся вам.</h3></li>
          <li className="mk-card mk-card-grid__item"><h3 className="mk-card-grid__title">20–30% подписки Scrooty начисляется ежемесячно.</h3></li>
          <li className="mk-card mk-card-grid__item"><h3 className="mk-card-grid__title">Настройка, аудит, интеграции и сопровождение тарифицируются вами.</h3></li>
        </ul>
      </Section>

      <Section id="levels" labelledBy="levels-title">
        <SectionHeader id="levels-title" eyebrow="УРОВНИ" title="Комиссия растёт вместе с вашей практикой."/>
        <div className="mk-table-wrap" role="region" aria-labelledby="levels-title" tabIndex={0}>
          <table className="mk-table">
            <thead>
              <tr><th scope="col">Уровень</th><th scope="col">Условие</th><th scope="col">Recurring</th><th scope="col">Для кого</th></tr>
            </thead>
            <tbody>
              {partnerLevels.map(level => (
                <tr key={level.id}>
                  <th scope="row">{level.name}</th>
                  <td>{level.requirement}</td>
                  <td>{percent(level.rate)}</td>
                  <td>{level.audience}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">{foundingCohort.name}</th>
                <td>Первые партнёры программы</td>
                <td>{percent(foundingCohort.rate)} — {foundingCohort.term}</td>
                <td>Первая когорта</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="calculator-section" labelledBy="calculator-title" tone="warm" stage>
        <SectionHeader id="calculator-title" eyebrow="КАЛЬКУЛЯТОР" title="Посчитайте recurring-доход." description="Формула видна целиком: клиенты × подписка × ваш процент."/>
        <PartnerCalculator id="calculator"/>
      </Section>

      <Section id="start" labelledBy="start-title">
        <div className="mk-split">
          <div>
            <SectionHeader id="start-title" eyebrow="СТАРТ" title="Как начать."/>
            <ol role="list" className="mk-steps">
              {startFlow.map(step => <li key={step}><span>{step}</span></li>)}
            </ol>
          </div>
          <div>
            <h3 className="mk-h3 mk-partners-matrix-title" id="matrix-title">Кто за что отвечает</h3>
            <div className="mk-table-wrap" role="region" aria-labelledby="matrix-title" tabIndex={0}>
              <table className="mk-table">
                <thead><tr><th scope="col">Область</th><th scope="col">Партнёр</th><th scope="col">Scrooty</th></tr></thead>
                <tbody>
                  {ownership.map(([area, partner, scrooty]) => (
                    <tr key={area}><th scope="row">{area}</th><td>{partner}</td><td>{scrooty}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mk-microcopy mk-steps-note">White label — в планах развития программы.</p>
          </div>
        </div>
      </Section>

      <Faq id="partner-faq" items={partnerFaq} title="Вопросы партнёров." eyebrow="ПАРТНЁРАМ" tone="surface"/>

      <Section id="partner-cta" labelledBy="partner-cta-title">
        <div className="mk-pricing-teaser">
          <div>
            <h2 id="partner-cta-title" className="mk-h3">Готовы внедрять Scrooty клиентам?</h2>
            <p className="mk-card__text">Комиссия начисляется по правилам партнёрской программы. Условия фиксации клиента и выплат раскрыты до регистрации.</p>
          </div>
          <div className="mk-pricing-teaser__actions">
            <ButtonLink variant="primary" href={productLinks.register} onClick={onCta}>Стать интегратором</ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
