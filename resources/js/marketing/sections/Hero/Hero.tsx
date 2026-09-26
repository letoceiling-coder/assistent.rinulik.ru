import {useRef} from 'react';
import {Button} from '../../components/Button/Button';
import {Container} from '../../components/Container';
import {DemoShell, type DemoShellHandle} from '../../components/DemoShell/DemoShell';
import {ctaLabels} from '../../config/cta';
import {demoScenarios, sampleConversation} from '../../demo/sample';
import './Hero.css';

/** Anchor target of the demo surface (spec destination `/#demo`). */
export const HERO_DEMO_ID = 'demo';

/**
 * Homepage hero (spec §10 Section 02). Copy is exact approved copy.
 * Owns layout and CTA wiring only; the conversation surface is DemoShell.
 */
export function Hero() {
  const demoRef = useRef<DemoShellHandle>(null);

  return (
    <section className="mk-hero" aria-labelledby="hero-title">
      <Container className="mk-hero__grid">
        <div className="mk-hero__copy">
          <p className="mk-eyebrow mk-hero__eyebrow">AI-МЕНЕДЖЕР ДЛЯ ВХОДЯЩИХ ОБРАЩЕНИЙ</p>
          {/* Each sentence is its own line box; the DOM text stays one continuous sentence pair. */}
          <h1 id="hero-title" className="mk-display-xl mk-hero__title">
            <span className="mk-hero__title-line">Клиент написал.</span>{' '}
            <span className="mk-hero__title-line">Scrooty уже отвечает.</span>
          </h1>
          <p className="mk-body-l mk-hero__body">
            AI-менеджер для Avito, Telegram, MAX и сайта. Знает ваш бизнес, отвечает по-человечески, собирает нужные данные и передаёт менеджеру готовый контекст.
          </p>
          <div className="mk-hero__actions">
            {/* Action, not navigation: focuses the demo input without leaving the page. */}
            <Button variant="primary" size="lg" onClick={() => demoRef.current?.focusInput()}>
              {ctaLabels.tryFree}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => demoRef.current?.reveal()}>
              Посмотреть, как отвечает
            </Button>
          </div>
          {/* Items never break internally; lines wrap only between them. */}
          <p className="mk-hero__support">
            <span>4 сообщения без регистрации</span> · <span>7 дней бесплатно</span> · <span>без карты</span>
          </p>
        </div>

        <div className="mk-hero__visual">
          <DemoShell
            ref={demoRef}
            id={HERO_DEMO_ID}
            mode="preview"
            messages={sampleConversation}
            scenarios={demoScenarios}
          />
        </div>
      </Container>
    </section>
  );
}
