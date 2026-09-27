import type {ReactNode, Ref} from 'react';
import type {ChatMessageData} from '../../demo/types';
import {ChatMessage} from '../ChatMessage/ChatMessage';
import './DemoShell.css';

/**
 * Presentational conversation frame (bar, message list, footer slot).
 * It holds no demo logic: marketing/demo/LiveDemo.tsx feeds it messages and renders the composer or a gate
 * into `children`. `live` turns the message list into a polite live region for new answers.
 */
export function DemoShell({id, frameRef, label, badge, messages, live, typing, attention, children}: {
  id?: string;
  frameRef?: Ref<HTMLElement>;
  label: string;
  badge: string;
  messages: readonly ChatMessageData[];
  live: boolean;
  typing?: boolean;
  attention?: boolean;
  children: ReactNode;
}) {
  return (
    <section ref={frameRef} id={id} className="mk-demo" data-live={live || undefined} data-attention={attention || undefined} tabIndex={-1} aria-label={label}>
      <div className="mk-demo__bar">
        <div className="mk-demo__identity">
          <span className="mk-demo__name">Scrooty</span>
          <span className="mk-demo__role">AI-менеджер</span>
        </div>
        <span className="mk-demo__badge">{badge}</span>
      </div>

      <div className="mk-demo__scroll">
        <ol
          role="list"
          className="mk-demo__messages"
          aria-label="Сообщения"
          aria-live={live ? 'polite' : undefined}
          aria-relevant={live ? 'additions' : undefined}
        >
          {messages.map(message => (
            <ChatMessage key={message.id} author={message.author} text={message.text} note={message.note}/>
          ))}
        </ol>
        {typing && (
          <p className="mk-demo__typing" role="status">
            <span className="mk-demo__typing-dots" aria-hidden="true"><i/><i/><i/></span>
            Scrooty формулирует ответ…
          </p>
        )}
      </div>

      <div className="mk-demo__composer">{children}</div>
    </section>
  );
}
