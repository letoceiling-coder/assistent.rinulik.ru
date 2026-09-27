import type {ChatAuthor} from '../../demo/types';
import mascotUrl from '../../../../images/marketing/scrooty-mascot.webp';
import './ChatMessage.css';

const authorLabel: Record<ChatAuthor, string> = {
  customer: 'Клиент',
  scrooty: 'Scrooty',
  system: 'Демо',
};

/**
 * One chat message. Authors differ by alignment, avatar and surface — not by colour alone.
 * Scrooty: small avatar + name + light bubble. Customer: compact bubble on the right, label for screen readers.
 * Renders an <li>: place inside an <ol>/<ul> conversation list. Text is rendered as-is (never typography-processed).
 */
export function ChatMessage({author, text, note, authorName, avatar = false}: {
  author: ChatAuthor;
  text: string;
  note?: string;
  authorName?: string;
  /** Show the mini Scrooty avatar (live demo). */
  avatar?: boolean;
}) {
  const name = authorName ?? authorLabel[author];
  return (
    <li className={`mk-msg mk-msg--${author}`}>
      {author === 'scrooty' && avatar && <img className="mk-msg__avatar" src={mascotUrl} alt="" width={28} height={28} decoding="async"/>}
      <div className="mk-msg__body">
        <span className={author === 'customer' ? 'mk-visually-hidden' : 'mk-msg__author'}>
          {name}
          {note && <span className="mk-msg__note"> · {note}</span>}
          {author === 'customer' && ': '}
        </span>
        <p className="mk-msg__bubble">{text}</p>
      </div>
    </li>
  );
}
