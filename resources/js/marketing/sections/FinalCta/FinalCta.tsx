import {track} from '../../analytics/track';
import {Button, ButtonLink} from '../../components/Button/Button';
import {Section} from '../../components/Section';
import {routePath} from '../../config/routes';
import {useDemo} from '../../demo/DemoProvider';
import mascotUrl from '../../../../images/marketing/scrooty-mascot.webp';
import './FinalCta.css';

/**
 * Homepage Section 15 — final CTA (spec §10). Uses the page's shared demo session: «Начать разговор»
 * brings the visitor to the same demo (and conversation) as the hero, it does not start a second engine.
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
        <p className="mk-eyebrow mk-final__eyebrow">ПОПРОБУЙТЕ НА СВОЁМ БИЗНЕСЕ</p>
        <h2 id="final-title" className="mk-h2 mk-final__title">Дайте Scrooty один вопрос. Он покажет себя сам.</h2>
        <p className="mk-body-l mk-final__body">Четыре сообщения без регистрации. Затем создайте своего AI-менеджера и тестируйте 7 дней бесплатно.</p>
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
            Начать разговор
          </Button>
          <ButtonLink variant="secondary" size="lg" href={routePath('pricing')}>Посмотреть тарифы</ButtonLink>
        </div>
        <p className="mk-microcopy">Без карты. Отменить можно до первой оплаты.</p>
        </div>
      </div>
    </Section>
  );
}
