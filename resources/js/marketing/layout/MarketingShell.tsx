import type {ReactNode} from 'react';
import {Container} from '../components/Container';

// Temporary structural shell for the marketing surface: skip link, header, main landmark, footer.
// Header/footer are placeholders; the real SiteHeader and Footer come in later stages.
export function MarketingShell({children}: {children: ReactNode}) {
  return (
    <div className="mk-root">
      <a className="mk-skip-link" href="#main">Перейти к содержанию</a>
      <header>
        <Container className="mk-shell-bar">
          <a href="/">Scrooty</a>
          <a href="/login">Войти</a>
        </Container>
      </header>
      <main id="main" tabIndex={-1}>{children}</main>
      <footer>
        <Container className="mk-shell-bar">
          <small>Scrooty</small>
        </Container>
      </footer>
    </div>
  );
}
