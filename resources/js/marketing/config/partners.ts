// Partner program economics (spec §12, §36). Single source for homepage teaser, /partners and the calculator.

export type PartnerLevelId = 'referral' | 'integrator' | 'growth' | 'scale';

export type PartnerLevel = {
  id: PartnerLevelId;
  name: string;
  /** Recurring commission share, 0..1. */
  rate: number;
  requirement: string;
  audience: string;
};

export const partnerLevels: readonly PartnerLevel[] = [
  {id: 'referral', name: 'Referral', rate: 0.2, requirement: 'Привели клиента', audience: 'Маркетологи, консультанты'},
  {id: 'integrator', name: 'Integrator', rate: 0.25, requirement: 'Сами ведёте настройку', audience: 'AI- и CRM-интеграторы'},
  {id: 'growth', name: 'Growth', rate: 0.27, requirement: '5–14 активных платящих клиентов', audience: 'Практики и студии'},
  {id: 'scale', name: 'Scale', rate: 0.3, requirement: '15+ активных платящих клиентов', audience: 'Агентства'},
];

export const foundingCohort = {name: 'Founding Integrator', rate: 0.3, term: 'первые 12 месяцев'};

export const percent = (rate: number) => `${Math.round(rate * 100)}%`;
