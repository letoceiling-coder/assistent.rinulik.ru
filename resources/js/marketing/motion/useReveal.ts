import {useEffect} from 'react';

/**
 * Arms the reveal system for the current page: observes every [data-reveal] element once and marks it
 * [data-revealed] when it enters the viewport. One observer per page; no-op with reduced motion or
 * without IntersectionObserver (content simply stays visible).
 */
export function useReveal(pageKey: string) {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])'));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute('data-revealed', '');
        observer.unobserve(entry.target);
      }
    }, {rootMargin: '0px 0px -8% 0px', threshold: 0.12});

    // Elements already in view on load are revealed immediately (no flash of hidden content above the fold).
    const vh = window.innerHeight;
    for (const el of targets) {
      if (el.getBoundingClientRect().top < vh * 0.92) el.setAttribute('data-revealed', '');
      else observer.observe(el);
    }
    root.setAttribute('data-reveal-ready', '');
    return () => observer.disconnect();
  }, [pageKey]);
}
