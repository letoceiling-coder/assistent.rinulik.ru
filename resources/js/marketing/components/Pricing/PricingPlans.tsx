import {useId, useLayoutEffect, useRef, useState} from 'react';
import {track} from '../../analytics/track';
import {productLinks} from '../../config/navigation';
import {limitLabels, planPrice, plans, type BillingPeriod, type Plan, type PlanId} from '../../config/pricing';
import {cx} from '../../../shared/lib/cx';
import {ButtonLink} from '../Button/Button';
import './Pricing.css';

/** Monthly / annual switch as a native radio group (keyboard: arrows). */
export function BillingToggle({value, onChange}: {value: BillingPeriod; onChange: (next: BillingPeriod) => void}) {
  const name = useId();
  const labels = useRef<Array<HTMLLabelElement | null>>([]);
  const [pill, setPill] = useState<{x: number; w: number} | null>(null);

  // Shared sliding pill under the selected period (transform/width only).
  useLayoutEffect(() => {
    const measure = () => {
      const el = labels.current[value === 'monthly' ? 0 : 1];
      if (el) setPill({x: el.offsetLeft, w: el.offsetWidth});
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [value]);
  const options: ReadonlyArray<{id: BillingPeriod; label: string; hint?: string}> = [
    {id: 'monthly', label: 'Помесячно'},
    {id: 'annual', label: 'За год', hint: '2 месяца в подарок'},
  ];
  return (
    <fieldset className={cx('mk-billing', pill && 'has-pill')}>
      <legend className="mk-visually-hidden">Период оплаты</legend>
      {pill && <span className="mk-billing__pill" aria-hidden="true" style={{transform: `translateX(${pill.x}px)`, width: pill.w}}/>}
      {options.map((option, index) => (
        <label key={option.id} ref={el => { labels.current[index] = el; }} className={cx('mk-billing__option', value === option.id && 'is-selected')}>
          <input
            type="radio"
            name={name}
            value={option.id}
            checked={value === option.id}
            onChange={() => {
              track('billing_period_changed', {from: value, to: option.id});
              onChange(option.id);
            }}
          />
          <span>{option.label}</span>
          {option.hint && <span className="mk-billing__hint">{option.hint}</span>}
        </label>
      ))}
    </fieldset>
  );
}

const enterpriseHighlights = ['Лимиты под ваш объём обращений', 'Индивидуальные интеграции', 'Поддержка по SLA'];

function PlanCard({plan, period, compact}: {plan: Plan; period: BillingPeriod; compact: boolean}) {
  const price = planPrice(plan, period);
  const titleId = `plan-${plan.id}`;
  const isEnterprise = plan.monthly === null;
  const shown = compact ? (['dialogs', 'managers', 'channels', 'integrations'] as const) : (Object.keys(limitLabels) as Array<keyof Plan['limits']>);
  return (
    <article className={cx('mk-plan', 'mk-lift', `mk-plan--${plan.id}`, plan.popular && 'mk-plan--popular')} aria-labelledby={titleId}>
      <div className="mk-plan__head">
        <h3 id={titleId} className="mk-plan__name">{plan.name}</h3>
        {plan.popular && <span className="mk-pill mk-pill--plain mk-plan__badge">Популярный</span>}
      </div>
      <p className="mk-plan__tagline">{plan.tagline}</p>
      <p className="mk-plan__price">
        <span key={price.main} className="mk-plan__amount">{price.main}</span> {price.unit && <span className="mk-plan__unit">{price.unit}</span>}
      </p>
      <p className="mk-plan__note">{price.note}</p>
      <ButtonLink
        variant={plan.popular ? 'primary' : 'secondary'}
        fullWidth
        href={productLinks.register}
        onClick={() => track('plan_selected', {plan: plan.id, billing_period: period})}
      >
        {isEnterprise ? 'Обсудить условия' : 'Начать бесплатно'}
      </ButtonLink>
      <ul role="list" className="mk-checks mk-plan__limits" aria-label={`Что входит в ${plan.name}`}>
        {isEnterprise
          ? enterpriseHighlights.map(item => <li key={item}>{item}</li>)
          : shown.map(key => <li key={key}>{plan.limits[key]}</li>)}
      </ul>
    </article>
  );
}

/** Plan cards from config/pricing.ts. Business is highlighted by border, not scale. */
export function PricingPlans({period, only, compact = false}: {period: BillingPeriod; only?: readonly PlanId[]; compact?: boolean}) {
  const list = only ? plans.filter(p => only.includes(p.id)) : plans;
  return (
    <div className={cx('mk-plans', `mk-plans--${list.length}`)}>
      {list.map(plan => <PlanCard key={plan.id} plan={plan} period={period} compact={compact}/>)}
    </div>
  );
}
