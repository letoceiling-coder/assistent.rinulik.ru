// Demo domain types (spec §18, §21).

export type ChatAuthor = 'customer' | 'scrooty' | 'system';

export type ChatMessageData = {
  id: string;
  author: ChatAuthor;
  text: string;
  /** Visible marker for prepared (non-generated) answers. */
  note?: string;
};

/** Suggestion chips (short visible label, full prompt inserted into the input). */
export type DemoScenarioId = 'coffee' | 'beauty' | 'avito' | 'handoff';

export type DemoScenario = {
  id: DemoScenarioId;
  /** Short chip label (1–2 words). */
  label: string;
  /** Text a suggestion chip puts into the input. Never sent automatically. */
  samplePrompt: string;
};

export type DemoErrorReason = 'network-error' | 'rate-limited' | 'unavailable' | 'session-expired' | 'daily-limit';

/** Async request lifecycle. Gates are derived from the session counters, not stored here. */
export type DemoRequestState =
  | {type: 'idle'}
  | {type: 'sending'}
  | {type: 'typing'}
  | {type: 'error'; reason: DemoErrorReason; retry?: RetryPayload};

/** What is needed to (re)request an answer for a visitor message already in the conversation. */
export type RetryPayload = {text: string; scenario: DemoScenarioId | null; messageNumber: number};

/** Persisted per browser tab (sessionStorage): the visible conversation and UI counters. The server keeps the real limit. */
export type DemoSession = {
  id: string;
  messages: ChatMessageData[];
  sentCount: number;
  responseCount: number;
  softGateDismissed: boolean;
  hardGateReached: boolean;
  lastScenario: DemoScenarioId | null;
  /** Last `remaining` reported by the server (source of truth); null before the first answer. */
  serverRemaining: number | null;
};

/** Everything the UI needs to know, derived from session + request + draft. */
export type DemoView =
  | 'idle'
  | 'editing'
  | 'sending'
  | 'typing'
  | 'complete'
  | 'soft-gate'
  | 'hard-gate'
  | DemoErrorReason;

/** Result contract of the demo transport (maps the endpoint's HTTP outcomes). */
export type DemoReply =
  | {type: 'answer'; text: string; remaining: number}
  | {type: 'demo-limit'}
  | {type: 'rate-limited'}
  | {type: 'daily-limit'}
  | {type: 'session-expired'}
  | {type: 'unavailable'};
