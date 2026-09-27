import type {ReactNode, Ref} from 'react';
import type {ChatMessageData} from '../../demo/types';
import mascotUrl from '../../../../images/marketing/scrooty-mascot.webp';
import {ChatMessage} from '../ChatMessage/ChatMessage';
import './DemoShell.css';

/**
 * Presentational conversation frame: a clean header (avatar, name, live status, subtle counter), the message list and
 * a footer slot. No demo logic: marketing/demo/LiveDemo.tsx feeds it. `live` makes the list a polite live region.
 * `preview` marks idle example messages, which are replaced as soon as a real conversation starts.
 */
export function DemoShell({id, frameRef, label, status, counter, messages, preview, live, typing, attention, size = 'hero', children}: {
  id?: string;
  frameRef?: Ref<HTMLElement>;
  label: string;
  status: string;
  counter?: string;
  messages: readonly ChatMessageData[];
  preview?: boolean;
  live: boolean;
  typing?: boolean;
  attention?: boolean;
  size?: 'hero' | 'page';
  children: ReactNode;
}) {
  return (
    <section
      ref={frameRef}
      id={id}
      className={`mk-demo mk-demo--${size}`}
      data-live={live || undefined}
      data-attention={attention || undefined}
      tabIndex={-1}
      aria-label={label}
    >
      <div className="mk-demo__bar">
        <img className="mk-demo__avatar" src={mascotUrl} alt="" width={36} height={36} decoding="async"/>
        <div className="mk-demo__identity">
          <span className="mk-demo__name">Scrooty</span>
          <span className="mk-demo__status"><i aria-hidden="true"/>{status}</span>
        </div>
        {counter && <span className="mk-demo__counter">{counter}</span>}
      </div>

      <div className="mk-demo__scroll">
        {preview && <p className="mk-demo__preview-label">Пример разговора</p>}
        <ol
          role="list"
          className={preview ? 'mk-demo__messages is-preview' : 'mk-demo__messages'}
          aria-label="Сообщения"
          aria-live={live ? 'polite' : undefined}
          aria-relevant={live ? 'additions' : undefined}
        >
          {messages.map(message => (
            <ChatMessage
              key={message.id}
              author={message.author}
              text={message.text}
              note={message.note}
              authorName={message.author === 'customer' && live ? 'Вы' : undefined}
              avatar
            />
          ))}
        </ol>
        {typing && (
          <div className="mk-demo__typing" role="status">
            <img className="mk-msg__avatar" src={mascotUrl} alt="" width={28} height={28}/>
            <span className="mk-demo__typing-dots" aria-hidden="true"><i/><i/><i/></span>
            <span className="mk-visually-hidden">Scrooty печатает…</span>
          </div>
        )}
      </div>

      <div className="mk-demo__composer">{children}</div>
    </section>
  );
}
