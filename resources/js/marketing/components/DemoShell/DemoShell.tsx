import {useEffect, useImperativeHandle, useRef, useState, type Ref} from 'react';
import type {ChatMessageData, DemoScenario} from '../../demo/types';
import {ChatInput} from '../ChatInput/ChatInput';
import {ChatMessage} from '../ChatMessage/ChatMessage';
import {SuggestionChip} from '../SuggestionChip/SuggestionChip';
import './DemoShell.css';

export type DemoShellHandle = {
  /** Brings the composer into view and focuses it (hero primary CTA). */
  focusInput: () => void;
  /** Brings the conversation into view, focuses the region and marks it briefly (hero secondary CTA). */
  reveal: () => void;
};

const ATTENTION_MS = 1200;

/**
 * Product conversation surface.
 * Stage 04 renders it in `preview` mode: static sample messages, local-only input, no sending.
 * Stage 05 will add a live mode driven by the demo state machine; the shell stays presentational.
 */
export function DemoShell({ref, id, mode, messages, scenarios}: {
  ref?: Ref<DemoShellHandle>;
  id?: string;
  mode: 'preview';
  messages: readonly ChatMessageData[];
  scenarios: readonly DemoScenario[];
}) {
  const shellRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const attentionTimer = useRef<number | undefined>(undefined);
  const [draft, setDraft] = useState('');
  const [attention, setAttention] = useState(false);

  useImperativeHandle(ref, () => ({
    focusInput() {
      // Scroll behaviour follows CSS (smooth unless reduced motion); scroll-padding keeps it below the sticky header.
      shellRef.current?.scrollIntoView({block: 'nearest'});
      inputRef.current?.focus({preventScroll: true});
    },
    reveal() {
      shellRef.current?.scrollIntoView({block: 'nearest'});
      shellRef.current?.focus({preventScroll: true});
      window.clearTimeout(attentionTimer.current);
      setAttention(true);
      attentionTimer.current = window.setTimeout(() => setAttention(false), ATTENTION_MS);
    },
  }), []);

  useEffect(() => () => window.clearTimeout(attentionTimer.current), []);

  function applySuggestion(prompt: string) {
    setDraft(prompt);
    inputRef.current?.focus();
  }

  return (
    <section
      ref={shellRef}
      id={id}
      className="mk-demo"
      data-mode={mode}
      data-attention={attention || undefined}
      tabIndex={-1}
      aria-label="Пример диалога со Scrooty"
    >
      <div className="mk-demo__bar">
        <div className="mk-demo__identity">
          <span className="mk-demo__name">Scrooty</span>
          <span className="mk-demo__role">AI-менеджер</span>
        </div>
        {mode === 'preview' && <span className="mk-demo__badge">Пример диалога</span>}
      </div>

      <ol role="list" className="mk-demo__messages" aria-label="Сообщения">
        {messages.map(message => (
          <ChatMessage key={message.id} author={message.author} text={message.text}/>
        ))}
      </ol>

      <div className="mk-demo__composer">
        <div className="mk-demo__suggestions" role="group" aria-label="Примеры вопросов">
          {scenarios.map(scenario => (
            <SuggestionChip key={scenario.id} onClick={() => applySuggestion(scenario.samplePrompt)}>
              {scenario.label}
            </SuggestionChip>
          ))}
        </div>
        {/* No onSubmit in preview mode: the send button stays disabled and nothing is sent. */}
        <ChatInput
          inputRef={inputRef}
          value={draft}
          onChange={setDraft}
          label="Сообщение для Scrooty"
          placeholder="Опишите свой бизнес или задайте вопрос"
        />
      </div>
    </section>
  );
}
