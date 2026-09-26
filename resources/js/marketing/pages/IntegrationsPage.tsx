import {track} from '../analytics/track';
import {ButtonLink} from '../components/Button/Button';
import {PageHero} from '../components/PageHero/PageHero';
import {Section} from '../components/Section';
import {SectionHeader} from '../components/SectionHeader';
import {channels, integrations, roadmapIntegrations, statusLabel} from '../config/integrations';
import {productLinks} from '../config/navigation';
import {routePath} from '../config/routes';
import {FinalCta} from '../sections/FinalCta/FinalCta';
import './channels/ChannelBlocks.css';
import './IntegrationsPage.css';

/** /integrations (spec §17). Card model: name, job, status, direction, setup, CTA. Statuses from config only. */
export function IntegrationsPage() {
  return (
    <>
      <PageHero
        eyebrow="ИНТЕГРАЦИИ"
        title="Scrooty умеет не только отвечать."
        body={<p>Каналы, где Scrooty ведёт диалог, и системы, куда он передаёт результат. У каждой интеграции указан честный статус.</p>}
        narrow
      />

      <Section id="catalog" labelledBy="catalog-title">
        <SectionHeader id="catalog-title" eyebrow="КАНАЛЫ И ДЕЙСТВИЯ" title="Что можно подключить."/>
        <ul role="list" className="mk-integrations">
          {integrations.map(item => {
            const channel = channels.find(c => c.id === item.id);
            return (
              <li key={item.id} className="mk-card mk-integration">
                <div className="mk-integration__head">
                  <h3 className="mk-integration__name">{item.name}</h3>
                  <span className={`mk-pill mk-pill--${item.status}`}>{statusLabel[item.status]}</span>
                </div>
                <p className="mk-card__text">{item.job}</p>
                <dl className="mk-integration__meta">
                  <div><dt>Направление</dt><dd>{item.direction}</dd></div>
                  <div><dt>Что нужно</dt><dd>{item.setup}</dd></div>
                </dl>
                {channel ? (
                  <ButtonLink variant="text" size="sm" href={routePath(channel.routeId)} onClick={() => track('integration_clicked', {integration: item.id, status: item.status})}>
                    Подробнее
                  </ButtonLink>
                ) : item.status === 'available' ? (
                  <ButtonLink variant="text" size="sm" href={productLinks.register}>Подключить</ButtonLink>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Section>

      <Section id="roadmap" labelledBy="roadmap-title" tone="surface">
        <SectionHeader
          id="roadmap-title"
          eyebrow="В ПЛАНАХ"
          title="Что появится позже."
          description="Эти интеграции в планах развития. Мы не показываем их как доступные, пока они не работают."
        />
        <ul role="list" className="mk-roadmap">
          {roadmapIntegrations.map(name => (
            <li key={name} className="mk-roadmap__item">
              <span>{name}</span>
              <span className="mk-pill mk-pill--planned">{statusLabel.planned}</span>
            </li>
          ))}
        </ul>
      </Section>

      <FinalCta/>
    </>
  );
}
