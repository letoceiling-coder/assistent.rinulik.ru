import type {ReactNode} from 'react';
import './SuggestionChip.css';

/** Neutral pill button for demo suggestions. Never an orange CTA. */
export function SuggestionChip({children, onClick}: {children: ReactNode; onClick: () => void}) {
  return (
    <button type="button" className="mk-chip" onClick={onClick}>
      {children}
    </button>
  );
}
