import {ArrowDown} from 'lucide-react';
import {track} from '../../analytics/track';
import {Button} from '../../components/Button/Button';
import {ChannelIcon} from '../../components/ChannelIcon/ChannelIcon';
import {Container} from '../../components/Container';
import {ctaLabels} from '../../config/cta';
import {channels} from '../../config/integrations';
import {routePath} from '../../config/routes';
import {useDemo} from '../../demo/DemoProvider';
import {LiveDemo} from '../../demo/LiveDemo';
import './Hero.css';

/** Anchor target of the demo surface (spec destination `/#demo`). */
export const HERO_DEMO_ID = 'demo';

/**
 * Homepage hero: one message, one action, one object.
 * H1 (approved) → one-line subtitle → primary CTA + quiet link → channel row → the live AI demo, centred.
 */
export function Hero() {
  const demo = useDemo();

  return (
    <section className="mk-hero" aria-labelledby="hero-title">
      {/* Soft light fields (cool, warm, mint). Light, not blobs; drift almost imperceptibly. */}
      <div className="mk-hero__fields" aria-hidden="true"><span/><span/><span/></div>
      <Container className="mk-hero__inner">
        <div className="mk-hero__intro">
          {/* Intentional two-line split of the approved H1; the DOM text stays one sentence pair. */}
          <h1 id="hero-title" className="mk-display-xl mk-hero__title">
            <span className="mk-hero__title-line">Клиент написал.</span>{' '}
            <span className="mk-hero__title-line">Scrooty уже отвечает.</span>
          </h1>
          <p className="mk-body-l mk-hero__body">Один AI-менеджер для&nbsp;Avito, Telegram, MAX и&nbsp;сайта.</p>
          <div className="mk-hero__actions">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                track('hero_cta_clicked', {cta_label: ctaLabels.tryFree});
                track('hero_demo_focused', {source: 'hero_primary'});
                demo.surface.current?.focusInput();
              }}
            >
              {ctaLabels.tryFree}
            </Button>
            <Button
              variant="text"
              size="lg"
              className="mk-hero__link"
              onClick={() => {
                track('hero_demo_focused', {source: 'hero_secondary'});
                demo.surface.current?.reveal();
              }}
            >
              Посмотреть, как отвечает <ArrowDown size={16} aria-hidden="true"/>
            </Button>
          </div>
          <p className="mk-hero__support">4&nbsp;сообщения без&nbsp;регистрации · 7&nbsp;дней бесплатно</p>
          <ul role="list" className="mk-hero__channels" aria-label="Каналы">
            {channels.map(c => (
              <li key={c.id}>
                <a className="mk-hero__channel" href={routePath(c.routeId)} data-channel={c.id}>
                  <ChannelIcon id={c.id}/>
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mk-hero__stage">
          <LiveDemo id={HERO_DEMO_ID}/>
        </div>
      </Container>
    </section>
  );
}
