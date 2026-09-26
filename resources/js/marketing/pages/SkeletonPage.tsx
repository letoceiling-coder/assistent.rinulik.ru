import type {MarketingRoute} from '../config/routes';
import {Section} from '../components/Section';
import {SectionHeader} from '../components/SectionHeader';

// Development placeholder rendered for every marketing route until real pages exist.
// Intentionally contains no marketing copy or design.
export function SkeletonPage({route}: {route: MarketingRoute}) {
  return (
    <Section labelledBy="page-title">
      <SectionHeader id="page-title" level={1} title="Scrooty"/>
      <p className="mk-dev-marker">Каркас маркетингового приложения · маршрут: {route.id}</p>
    </Section>
  );
}
