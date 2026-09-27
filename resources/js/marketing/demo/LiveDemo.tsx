import {useEffect, useImperativeHandle, useRef, useState} from 'react';
import {track} from '../analytics/track';
import {Button, ButtonLink} from '../components/Button/Button';
import {ChatInput} from '../components/ChatInput/ChatInput';
import {DemoShell} from '../components/DemoShell/DemoShell';
import {SuggestionChip} from '../components/SuggestionChip/SuggestionChip';
import {productLinks} from '../config/navigation';
import {routePath} from '../config/routes';
import {useDemo} from './DemoProvider';
import {demoErrorCopy, demoScenarios, sampleConversation} from './sample';

const ATTENTION_MS = 1200;

/** Gate copy: titles/buttons are spec §21; the hard-gate body is adapted — the demo dialog is not transferred to the account. */
const gateCopy = {
  soft: {
    title: 'Похоже, Scrooty уже понял ваш сценарий.',
    body: 'Создайте своего менеджера и продолжите с вашими знаниями и каналами.',
    primary: 'Создать бесплатно',
    secondary: 'Ещё одно сообщение',
  },
  hard: {
    title: 'Продолжите уже со своим Scrooty.',
    body: 'Создайте аккаунт и настройте своего менеджера на ваших данных. 7 дней теста, карта не нужна.',
    primary: 'Создать аккаунт',
    secondary: 'Посмотреть тарифы',
  },
} as const;

/**
 * The interactive demo surface, answered live by the rate-limited demo endpoint (POST /api/v1/demo/messages).
 * Rendered once per page; registers itself as the page's demo surface for CTAs.
 */
export function LiveDemo({id}: {id?: string}) {
  const demo = useDemo();
  const {view, session, draft, busy, remaining, started} = demo;
  const frameRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const gateTitleRef = useRef<HTMLHeadingElement>(null);
  const attentionTimer = useRef<number | undefined>(undefined);
  const [attention, setAttention] = useState(false);

  useImperativeHandle(demo.surface, () => ({
    focusInput() {
      // Scroll behaviour follows CSS (smooth unless reduced motion); scroll-padding keeps it below the sticky header.
      frameRef.current?.scrollIntoView({block: 'nearest'});
      (inputRef.current ?? gateTitleRef.current ?? frameRef.current)?.focus({preventScroll: true});
    },
    reveal() {
      frameRef.current?.scrollIntoView({block: 'nearest'});
      frameRef.current?.focus({preventScroll: true});
      window.clearTimeout(attentionTimer.current);
      setAttention(true);
      attentionTimer.current = window.setTimeout(() => setAttention(false), ATTENTION_MS);
    },
  }), []);

  useEffect(() => () => window.clearTimeout(attentionTimer.current), []);

  // Keep the newest message visible inside the conversation (the page itself does not scroll).
  useEffect(() => {
    if (!started) return;
    const scroller = frameRef.current?.querySelector('.mk-demo__scroll');
    scroller?.scrollTo({top: scroller.scrollHeight});
  }, [session.messages.length, view, started]);

  // A gate replaces the composer: move focus to its title so keyboard and screen-reader users land on it.
  const isGate = view === 'soft-gate' || view === 'hard-gate';
  const gateSeenOnMount = useRef(isGate);
  useEffect(() => {
    // A gate restored from the saved session on page load must not grab initial focus.
    if (!isGate || gateSeenOnMount.current) {
      gateSeenOnMount.current = false;
      return;
    }
    // Only when focus was in the demo (the removed composer leaves it on <body>); never steal it from elsewhere.
    const active = document.activeElement;
    if (active === document.body || frameRef.current?.contains(active)) gateTitleRef.current?.focus({preventScroll: true});
  }, [isGate]);

  function trackSignup(source: string) {
    track('signup_started', {source, preserved_demo: false});
  }

  function continueDemo() {
    focusInputAfterGate.current = true;
    demo.dismissSoftGate();
  }

  // «Ещё одно сообщение» brings the composer back; put the caret in it once it is rendered.
  const focusInputAfterGate = useRef(false);
  useEffect(() => {
    if (!isGate && focusInputAfterGate.current) {
      focusInputAfterGate.current = false;
      inputRef.current?.focus();
    }
  }, [isGate]);

  let footer;
  if (view === 'soft-gate' || view === 'hard-gate') {
    const copy = view === 'soft-gate' ? gateCopy.soft : gateCopy.hard;
    footer = (
      <div className="mk-demo__gate">
        <h2 ref={gateTitleRef} tabIndex={-1} className="mk-demo__gate-title">{copy.title}</h2>
        <p className="mk-demo__gate-body">{copy.body}</p>
        <div className="mk-demo__gate-actions">
          <ButtonLink variant="primary" href={productLinks.register} onClick={() => trackSignup(view === 'soft-gate' ? 'demo_soft_gate' : 'demo_hard_gate')}>
            {copy.primary}
          </ButtonLink>
          {view === 'soft-gate'
            ? <Button variant="secondary" onClick={continueDemo}>{copy.secondary}</Button>
            : <ButtonLink variant="secondary" href={routePath('pricing')}>{copy.secondary}</ButtonLink>}
        </div>
      </div>
    );
  } else if (view === 'daily-limit' || view === 'session-expired' || view === 'network-error' || view === 'rate-limited' || view === 'unavailable') {
    footer = (
      <div className="mk-demo__alert" role="alert">
        <span>{demoErrorCopy[view]}</span>
        {(view === 'network-error' || view === 'rate-limited' || view === 'unavailable') && (
          <Button variant="secondary" size="sm" onClick={demo.retry}>Повторить</Button>
        )}
        {view === 'session-expired' && <Button variant="secondary" size="sm" onClick={demo.restart}>Начать заново</Button>}
        {view === 'daily-limit' && (
          <ButtonLink variant="primary" size="sm" href={productLinks.register} onClick={() => trackSignup('demo_daily_limit')}>
            Создать аккаунт
          </ButtonLink>
        )}
      </div>
    );
  } else {
    footer = (
      <>
        <div className="mk-demo__suggestions" role="group" aria-label="Примеры вопросов">
          {demoScenarios.map(scenario => (
            <SuggestionChip
              key={scenario.id}
              onClick={() => {
                demo.chooseScenario(scenario.id, scenario.samplePrompt);
                inputRef.current?.focus();
              }}
            >
              {scenario.label}
            </SuggestionChip>
          ))}
        </div>
        <ChatInput
          inputRef={inputRef}
          value={draft}
          onChange={demo.setDraft}
          onSubmit={demo.send}
          sendDisabled={busy}
          label="Сообщение для Scrooty"
          maxLength={800}
          placeholder="Опишите свой бизнес или задайте вопрос"
        />
        <p className="mk-demo__meta">
          {started
            ? `Демо-версия · отвечает нейросеть Scrooty · без регистрации осталось сообщений: ${remaining}`
            : 'Демо-версия · отвечает нейросеть Scrooty · 4 сообщения без регистрации'}
          <br/>
          <span className="mk-demo__note">Демо без вашей базы знаний: ответы общие, факты о вашем бизнесе Scrooty уточнит.</span>
        </p>
      </>
    );
  }

  return (
    <div className="mk-live-demo">
      <DemoShell
        id={id}
        frameRef={frameRef}
        label={started ? 'Демо-диалог со Scrooty' : 'Пример диалога со Scrooty'}
        badge={started ? 'Демо' : 'Пример диалога'}
        messages={started ? session.messages : sampleConversation}
        live={started}
        typing={view === 'typing' || view === 'sending'}
        attention={attention}
      >
        {footer}
      </DemoShell>
    </div>
  );
}
