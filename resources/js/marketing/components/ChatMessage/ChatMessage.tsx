import type {ChatAuthor} from '../../demo/types';
import './ChatMessage.css';

const authorLabel: Record<ChatAuthor, string> = {
  customer: 'Клиент',
  scrooty: 'Scrooty',
};

/**
 * One chat bubble. Authors differ by alignment, visible label and surface — not by colour alone.
 * Renders an <li>: place inside an <ol>/<ul> conversation list.
 */
export function ChatMessage({author, text}: {author: ChatAuthor; text: string}) {
  return (
    <li className={`mk-msg mk-msg--${author}`}>
      <span className="mk-msg__author">{authorLabel[author]}</span>
      <p className="mk-msg__bubble">{text}</p>
    </li>
  );
}
