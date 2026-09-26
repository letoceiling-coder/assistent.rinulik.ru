import {useEffect} from 'react';
import {track} from '../analytics/track';
import type {MarketingRoute} from '../config/routes';
import {OG_IMAGE, SITE_ORIGIN, pageMeta} from '../config/seo';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Client-side title/description/canonical/OG/robots for the current marketing route + page_view event. */
export function usePageMeta(route: MarketingRoute) {
  useEffect(() => {
    const meta = pageMeta[route.id];
    const url = `${SITE_ORIGIN}${route.path === '/' ? '/' : route.path}`;
    document.title = meta.title;
    upsertMeta('name', 'description', meta.description);
    upsertMeta('name', 'robots', meta.robots ?? 'index,follow');
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:site_name', 'Scrooty');
    upsertMeta('property', 'og:locale', 'ru_RU');
    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', OG_IMAGE);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'theme-color', '#F7F5F1');
    upsertCanonical(url);
    track('page_view', {title: meta.title, route_type: 'marketing'});
  }, [route]);
}
