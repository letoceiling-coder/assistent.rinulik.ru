import {track} from '../../analytics/track';
import {ButtonLink} from '../../components/Button/Button';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {partnerLevels, percent} from '../../config/partners';
import {routePath} from '../../config/routes';
import './PartnersTeaser.css';

const rates = partnerLevels.map(level => level.rate);
const recurringRange = `${percent(Math.min(...rates)).replace('%', '')}–${percent(Math.max(...rates))}`;

/** Homepage — partners, compact: two numbers and one action. Details live on /partners. */
export function PartnersTeaser() {
  return (
    <Section id="partners" labelledBy="partners-title" tone="warm" stage>
      <div className="mk-partners-teaser">
        <SectionHeader id="partners-title" title="Внедряйте Scrooty клиентам."/>
        <dl className="mk-partners-teaser__numbers">
          <div>
            <dt className="mk-partners-teaser__rate">{recurringRange}</dt>
            <dd>ежемесячно, пока клиент платит</dd>
          </div>
          <div>
            <dt className="mk-partners-teaser__rate">100%</dt>
            <dd>оплаты за&nbsp;внедрение — ваши</dd>
          </div>
        </dl>
        <ButtonLink variant="secondary" href={routePath('partners')} onClick={() => track('partner_cta_clicked', {surface: 'homepage'})}>Интеграторам</ButtonLink>
      </div>
    </Section>
  );
}
