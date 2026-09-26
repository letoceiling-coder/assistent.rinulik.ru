import {useId, type FormEvent, type KeyboardEvent, type Ref} from 'react';
import './ChatInput.css';

/**
 * Accessible chat composer (controlled). Sending is enabled only when the owner passes `onSubmit`
 * and does not mark it `sendDisabled` (e.g. while an answer is pending).
 */
export function ChatInput({inputRef, value, onChange, onSubmit, sendDisabled = false, label, placeholder}: {
  inputRef?: Ref<HTMLTextAreaElement>;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (text: string) => void;
  sendDisabled?: boolean;
  label: string;
  placeholder?: string;
}) {
  const id = useId();
  const canSend = Boolean(onSubmit) && !sendDisabled && value.trim().length > 0;

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (canSend) onSubmit?.(value.trim());
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter sends, Shift+Enter inserts a new line.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form className="mk-chat-input" onSubmit={submit}>
      <label className="mk-visually-hidden" htmlFor={id}>{label}</label>
      <textarea
        ref={inputRef}
        id={id}
        className="mk-chat-input__field"
        rows={1}
        value={value}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button type="submit" className="mk-chat-input__send" aria-label="Отправить" disabled={!canSend}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
          <path d="M9 14V4M4.5 8.5 9 4l4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </form>
  );
}
