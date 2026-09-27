import {track} from '../../analytics/track';
import {Button, ButtonLink} from '../../components/Button/Button';
import {Section} from '../../components/Section';
import {ctaLabels} from '../../config/cta';
import {routePath} from '../../config/routes';
import {useDemo} from '../../demo/DemoProvider';
import mascotUrl from '../../../../images/marketing/scrooty-mascot.webp';
import './FinalCta.css';

/**
 * Homepage — final CTA (second and last mascot appearance). Uses the page's shared demo session:
 * the primary action brings the visitor to the same demo (and conversation) as the hero, it does not start a second engine.
 * On pages without a demo surface it links to /demo.
 */
export function FinalCta() {
  const demo = useDemo();
  return (
    <Section id="start" labelledBy="final-title" reveal="scale-soft">
      <div className="mk-final">
        <div className="mk-final__fields" aria-hidden="true"><span/><span/><span/></div>
        <div className="mk-final__panel">
        <img className="mk-final__mascot" src={mascotUrl} alt="" width={96} height={96} loading="lazy" decoding="async"/>
        <h2 id="final-title" className="mk-h2 mk-final__title">Задайте Scrooty свой вопрос.</h2>
        <p className="mk-body-l mk-final__body">4&nbsp;сообщения без&nbsp;регистрации · 7&nbsp;дней бесплатно</p>
        <div className="mk-final__actions">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              track('hero_demo_focused', {source: 'final_cta'});
              if (demo.surface.current) demo.surface.current.focusInput();
              else window.location.assign(routePath('demo'));
            }}
          >
            {ctaLabels.tryFree}
          </Button>
          <ButtonLink variant="text" size="lg" href={routePath('pricing')}>Тарифы</ButtonLink>
        </div>
        </div>
      </div>
    </Section>
  );
}
