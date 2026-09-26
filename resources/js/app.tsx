// Vite entry referenced by resources/views/app.blade.php.
// Owns the single React root and picks the application for the current URL.
// Each application lives in its own lazily loaded chunk, so a marketing visitor
// does not download the product/admin app and vice versa.
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {resolveSurface} from './surface';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root is missing.');

const surface = resolveSurface(window.location.pathname);
const root = createRoot(container);

function renderLoadError(error: unknown) {
  console.error('Failed to load application chunk', error);
  container!.textContent = 'Не удалось загрузить страницу. Обновите страницу.';
}

if (surface.type === 'marketing') {
  import('./marketing/MarketingApp')
    .then(({MarketingApp}) => root.render(<StrictMode><MarketingApp route={surface.route}/></StrictMode>))
    .catch(renderLoadError);
} else {
  // The product app is rendered exactly as before the split (no StrictMode) to avoid changing its runtime behaviour.
  import('./product/ProductApp')
    .then(({ProductApp}) => root.render(<ProductApp/>))
    .catch(renderLoadError);
}
