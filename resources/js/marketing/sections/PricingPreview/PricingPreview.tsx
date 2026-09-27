import {useEffect, useState} from 'react';
import {track} from '../../analytics/track';
import {ButtonLink} from '../../components/Button/Button';
import {BillingToggle, PricingPlans} from '../../components/Pricing/PricingPlans';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {dialogDefinition, trialNote, type BillingPeriod} from '../../config/pricing';
import {routePath} from '../../config/routes';
import './PricingPreview.css';

/** Homepage — compact pricing preview. Same config as /pricing. */
export function PricingPreview() {
  const [period, setPeriod] = useState<BillingPeriod>('monthly');

  useEffect(() => {
    const node = document.getElementById('pricing');
    if (!node || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        track('pricing_view', {surface: 'homepage'});
        observer.disconnect();
      }
    }, {threshold: 0.3});
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Section id="pricing" labelledBy="pricing-title" tone="canvas" className="mk-pricing-preview">
      <SectionHeader id="pricing-title" align="center" title={'Тарифы от 2\u00a0490\u00a0₽ в\u00a0месяц.'}/>
      <div className="mk-pricing-toggle">
        <BillingToggle value={period} onChange={setPeriod}/>
      </div>
      <PricingPlans period={period} only={['start', 'business', 'pro']} compact/>
      <div className="mk-section-cta mk-pricing-preview__foot">
        <p className="mk-microcopy">{trialNote} {dialogDefinition}</p>
        <ButtonLink variant="text" href={routePath('pricing')}>Сравнить все тарифы</ButtonLink>
      </div>
    </Section>
  );
}
