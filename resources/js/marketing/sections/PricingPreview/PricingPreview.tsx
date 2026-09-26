import {useEffect, useState} from 'react';
import {track} from '../../analytics/track';
import {ButtonLink} from '../../components/Button/Button';
import {BillingToggle, PricingPlans} from '../../components/Pricing/PricingPlans';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {dialogDefinition, type BillingPeriod} from '../../config/pricing';
import {routePath} from '../../config/routes';

/** Homepage Section 12 — pricing preview (spec §10). Same config as /pricing. */
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
    <Section id="pricing" labelledBy="pricing-title">
      <SectionHeader
        id="pricing-title"
        eyebrow="ПРОЗРАЧНЫЕ ТАРИФЫ"
        title="Начните с 2 490 ₽ в месяц."
        description="Во всех тарифах есть 7 дней бесплатно без карты. Вы платите за объём диалогов и возможности, а не за название модели."
      />
      <div className="mk-pricing-toggle">
        <BillingToggle value={period} onChange={setPeriod}/>
      </div>
      <PricingPlans period={period} only={['start', 'business', 'pro']} compact/>
      <div className="mk-section-cta">
        <ButtonLink variant="secondary" href={routePath('pricing')}>Сравнить тарифы</ButtonLink>
        <p className="mk-microcopy">{dialogDefinition} Enterprise — индивидуальные условия.</p>
      </div>
    </Section>
  );
}
