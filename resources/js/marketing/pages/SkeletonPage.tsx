import type {MarketingRoute} from '../config/routes';

// Development placeholder rendered for every marketing route until real pages exist.
// Intentionally contains no marketing copy or design.
export function SkeletonPage({route}: {route: MarketingRoute}) {
  return (
    <>
      <h1>Scrooty</h1>
      <p className="mk-dev-marker">Каркас маркетингового приложения · маршрут: {route.id}</p>
    </>
  );
}
