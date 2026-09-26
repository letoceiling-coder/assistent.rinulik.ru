// Local decorative icons for the header (no icon library in the marketing bundle). Always aria-hidden.

export function ChevronDownIcon() {
  return (
    <svg className="mk-icon-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
      <path d="M3 4.5 6 7.5l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
