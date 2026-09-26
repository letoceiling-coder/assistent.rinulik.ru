import type {ChatAuthor} from '../../demo/types';
import './ChatMessage.css';

const authorLabel: Record<ChatAuthor, string> = {
  customer: 'Клиент',
  scrooty: 'Scrooty',
  system: 'Демо',
};

/**
 * One chat bubble. Authors differ by alignment, visible label and surface — not by colour alone.
 * `note` is a visible marker such as «Пример ответа» for prepared (non-generated) answers.
 * Renders an <li>: place inside an <ol>/<ul> conversation list.
 */
export function ChatMessage({author, text, note, authorName}: {author: ChatAuthor; text: string; note?: string; authorName?: string}) {
  return (
    <li className={`mk-msg mk-msg--${author}`}>
      <span className="mk-msg__author">
        {authorName ?? authorLabel[author]}
        {note && <span className="mk-msg__note"> · {note}</span>}
      </span>
      <p className="mk-msg__bubble">{text}</p>
    </li>
  );
}
