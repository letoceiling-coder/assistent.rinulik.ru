import {useEffect, useState} from 'react';
import {track} from '../analytics/track';
import {ButtonLink} from '../components/Button/Button';
import {PageHero} from '../components/PageHero/PageHero';
import {BillingToggle, PricingPlans} from '../components/Pricing/PricingPlans';
import {Section} from '../components/Section';
import {SectionHeader} from '../components/SectionHeader';
import {pricingFaq} from '../config/faq';
import {productLinks} from '../config/navigation';
import {dialogDefinition, limitLabels, planPrice, plans, type BillingPeriod, type Plan} from '../config/pricing';
import {Faq} from '../sections/Faq/Faq';
import {FinalCta} from '../sections/FinalCta/FinalCta';
import './channels/ChannelBlocks.css';

/** /pricing (spec §11). Everything comes from config/pricing.ts. No overage prices until billing is final. */
export function PricingPage() {
  const [period, setPeriod] = useState<BillingPeriod>('monthly');
  useEffect(() => track('pricing_view', {surface: 'pricing_page'}), []);

  return (
    <>
      <PageHero
        eyebrow="ТАРИФЫ"
        title="Тарифы, которые растут вместе с обращениями."
        body={<p>7 дней бесплатно без карты во всех тарифах. Понятные лимиты диалогов и интеграций.</p>}
        narrow
      />

      <Section id="plans" labelledBy="plans-title">
        <h2 id="plans-title" className="mk-visually-hidden">Тарифы</h2>
        <div className="mk-pricing-toggle">
          <BillingToggle value={period} onChange={setPeriod}/>
        </div>
        <PricingPlans period={period}/>
        <p className="mk-microcopy mk-plans-note">{dialogDefinition}</p>
      </Section>

      <Section id="compare" labelledBy="compare-title" tone="surface">
        <SectionHeader id="compare-title" eyebrow="СРАВНЕНИЕ" title="Что входит в каждый тариф."/>
        <div className="mk-table-wrap" role="region" aria-labelledby="compare-title" tabIndex={0}>
          <table className="mk-table">
            <thead>
              <tr>
                <th scope="col">Возможность</th>
                {plans.map(plan => <th key={plan.id} scope="col">{plan.name}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Цена</th>
                {plans.map(plan => {
                  const price = planPrice(plan, period);
                  return <td key={plan.id}>{price.main} {price.unit}</td>;
                })}
              </tr>
              {(Object.keys(limitLabels) as Array<keyof Plan['limits']>).map(key => (
                <tr key={key}>
                  <th scope="row">{limitLabels[key]}</th>
                  {plans.map(plan => <td key={plan.id}>{plan.limits[key]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="usage" labelledBy="usage-title">
        <div className="mk-split">
          <SectionHeader
            id="usage-title"
            eyebrow="КАК СЧИТАЕТСЯ ОБЪЁМ"
            title="Вы платите за диалоги и возможности, а не за название модели."
            description={dialogDefinition}
          />
          <div className="mk-card">
            <h3 className="mk-card__title">Enterprise</h3>
            <p className="mk-card__text">Индивидуальные лимиты, интеграции и условия поддержки для компаний с большим потоком обращений.</p>
            <div className="mk-section-cta">
              <ButtonLink variant="secondary" href={productLinks.register}>Обсудить условия</ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      <Faq id="pricing-faq" items={pricingFaq} title="Вопросы об оплате." eyebrow="ТАРИФЫ" tone="surface"/>
      <FinalCta/>
    </>
  );
}
