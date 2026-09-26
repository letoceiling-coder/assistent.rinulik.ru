import {track} from '../../analytics/track';
import {ButtonLink} from '../../components/Button/Button';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {partnerLevels, percent} from '../../config/partners';
import {routePath} from '../../config/routes';
import './PartnersTeaser.css';

/** Homepage Section 13 — partners (spec §10). */
export function PartnersTeaser() {
  return (
    <Section id="partners" labelledBy="partners-title" tone="surface">
      <div className="mk-split">
        <div>
          <SectionHeader
            id="partners-title"
            eyebrow="ДЛЯ ИНТЕГРАТОРОВ И АГЕНТСТВ"
            title="Внедряете AI клиентам? Зарабатывайте вместе со Scrooty."
            description="Берите 100% оплаты за настройку и получайте от 20% до 30% recurring commission, пока закреплённый клиент оплачивает Scrooty."
          />
          <div className="mk-section-cta">
            <ButtonLink variant="secondary" href={routePath('partners')} onClick={() => track('partner_cta_clicked', {surface: 'homepage'})}>Стать интегратором</ButtonLink>
            <ButtonLink variant="text" href={`${routePath('partners')}#calculator`}>Посчитать доход</ButtonLink>
          </div>
          <p className="mk-microcopy mk-partners-teaser__micro">Комиссия начисляется по правилам партнёрской программы. Условия фиксации клиента и выплат раскрыты до регистрации.</p>
        </div>
        <ul role="list" className="mk-partners-teaser__levels">
          <li className="mk-card mk-card--soft">
            <span className="mk-partners-teaser__rate">100%</span>
            <span className="mk-card__text">оплаты за внедрение остаётся вам</span>
          </li>
          {partnerLevels.map(level => (
            <li key={level.id} className="mk-card">
              <span className="mk-partners-teaser__rate">{percent(level.rate)}</span>
              <span><strong>{level.name}</strong> · <span className="mk-card__text">{level.requirement}</span></span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
