import type {ReactNode} from 'react';

// Temporary structural shell for the marketing surface: skip link, header, main landmark, footer.
// Header/footer are placeholders; the real SiteHeader and Footer come in later stages.
export function MarketingShell({children}: {children: ReactNode}) {
  return (
    <div className="mk-root">
      <a className="mk-skip-link" href="#main">Перейти к содержанию</a>
      <header className="mk-header">
        <a href="/">Scrooty</a>
        <a href="/login">Войти</a>
      </header>
      <main id="main" tabIndex={-1}>{children}</main>
      <footer className="mk-footer">
        <small>Scrooty</small>
      </footer>
    </div>
  );
}
