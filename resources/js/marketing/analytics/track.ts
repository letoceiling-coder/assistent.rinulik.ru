// Typed analytics abstraction (spec §33). No vendor is connected: the default adapter is a no-op.
// A provider is plugged in later with setAnalyticsAdapter() — call sites do not change.
//
// Privacy rule: never pass message text, email, phone, knowledge content or file names.
// Every property below is a category, a count or a fixed label.

export type AnalyticsEvents = {
  page_view: {title: string; route_type: 'marketing'};
  hero_cta_clicked: {cta_label: string};
  hero_demo_focused: {source: 'hero_primary' | 'hero_secondary' | 'final_cta'};
  demo_started: {scenario: string; entry_page: string};
  demo_message_sent: {message_number: number; scenario: string};
  demo_response_received: {status: 'sample' | 'fallback' | 'error'};
  demo_gate_seen: {gate_type: 'soft' | 'hard' | 'daily_limit'; message_count: number};
  signup_started: {source: string; preserved_demo: boolean};
  pricing_view: {surface: 'homepage' | 'pricing_page'};
  billing_period_changed: {from: 'monthly' | 'annual'; to: 'monthly' | 'annual'};
  plan_selected: {plan: string; billing_period: 'monthly' | 'annual'};
  integration_clicked: {integration: string; status: string};
  partner_cta_clicked: {surface: string};
  faq_opened: {question_id: string};
};

export type AnalyticsEventName = keyof AnalyticsEvents;
export type AnalyticsAdapter = <E extends AnalyticsEventName>(event: E, props: AnalyticsEvents[E]) => void;

let adapter: AnalyticsAdapter = () => {};

export function setAnalyticsAdapter(next: AnalyticsAdapter): void {
  adapter = next;
}

export function track<E extends AnalyticsEventName>(event: E, props: AnalyticsEvents[E]): void {
  try {
    adapter(event, props);
  } catch {
    // Analytics must never break the page.
  }
}
