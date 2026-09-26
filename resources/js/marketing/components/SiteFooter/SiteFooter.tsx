import {anchorHref, productLinks} from '../../config/navigation';
import {routePath} from '../../config/routes';
import {Container} from '../Container';
import {Wordmark} from '../SiteHeader/Wordmark';
import './SiteFooter.css';

type FooterLink = {label: string; href: string};

const groups: ReadonlyArray<{title: string; links: readonly FooterLink[]}> = [
  {
    title: 'Продукт',
    links: [
      {label: 'Возможности', href: anchorHref('features')},
      {label: 'Демо', href: routePath('demo')},
      {label: 'Интеграции', href: routePath('integrations')},
      {label: 'Тарифы', href: routePath('pricing')},
      {label: 'Войти', href: productLinks.login},
    ],
  },
  {
    title: 'Решения',
    links: [
      {label: 'Для Avito', href: routePath('avito-ai')},
      {label: 'Для Telegram', href: routePath('telegram-ai')},
      {label: 'Для MAX', href: routePath('max-ai')},
      {label: 'Для сайта', href: routePath('site-ai')},
    ],
  },
  {
    title: 'Партнёрам',
    links: [
      {label: 'Партнёрская программа', href: routePath('partners')},
      {label: 'Условия программы', href: `${routePath('partners')}#levels`},
      {label: 'Посчитать доход', href: `${routePath('partners')}#calculator`},
    ],
  },
];

/**
 * Legal documents, requisites, service status and contacts are not published yet
 * (docs/scrooty/frontend-backend-todo.md §7). They are listed without links and never with placeholder data.
 */
const pendingDocs = ['Политика конфиденциальности', 'Обработка персональных данных', 'Пользовательское соглашение', 'Реквизиты'];

export function SiteFooter({isHome}: {isHome: boolean}) {
  return (
    <footer className="mk-footer">
      <Container>
        <div className="mk-footer__grid">
          <div className="mk-footer__brand">
            <Wordmark isCurrent={isHome} height={32}/>
            <p className="mk-footer__tagline">AI-менеджер, который отвечает клиентам быстро и по-человечески.</p>
          </div>
          {groups.map(group => (
            <nav key={group.title} className="mk-footer__group" aria-label={group.title}>
              <h2 className="mk-footer__title">{group.title}</h2>
              <ul role="list">
                {group.links.map(link => (
                  <li key={link.label}><a className="mk-footer__link" href={link.href}>{link.label}</a></li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="mk-footer__group">
            <h2 className="mk-footer__title">Документы</h2>
            <ul role="list" className="mk-footer__pending">
              {pendingDocs.map(doc => <li key={doc}>{doc}</li>)}
            </ul>
            <p className="mk-footer__note">Публикуются перед запуском.</p>
          </div>
        </div>
        <div className="mk-footer__bottom">
          <p>© 2026 Scrooty. Все права защищены.</p>
        </div>
      </Container>
    </footer>
  );
}
