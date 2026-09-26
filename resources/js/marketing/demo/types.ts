// Demo domain types (spec §18, §21).

export type ChatAuthor = 'customer' | 'scrooty' | 'system';

export type ChatMessageData = {
  id: string;
  author: ChatAuthor;
  text: string;
  /** Visible marker for prepared (non-generated) answers. */
  note?: string;
};

/** Scenario selectors from spec §18. */
export type DemoScenarioId = 'my-business' | 'avito' | 'site' | 'handoff';

export type DemoScenario = {
  id: DemoScenarioId;
  label: string;
  /** Text a suggestion chip puts into the input. Never sent automatically. */
  samplePrompt: string;
  /** Prepared answer used by the scenario sandbox. Not an AI generation. */
  sampleAnswer: string;
};

export type DemoErrorReason = 'network-error' | 'safety-refusal' | 'session-expired' | 'daily-limit';

/** Async request lifecycle. Gates are derived from the session counters, not stored here. */
export type DemoRequestState =
  | {type: 'idle'}
  | {type: 'sending'}
  | {type: 'typing'}
  | {type: 'error'; reason: DemoErrorReason; retry?: RetryPayload};

/** What is needed to (re)request an answer for a visitor message already in the conversation. */
export type RetryPayload = {text: string; scenario: DemoScenarioId | null; messageNumber: number};

/** Persisted per browser tab (sessionStorage). Contains only what the visitor typed in this tab. */
export type DemoSession = {
  id: string;
  messages: ChatMessageData[];
  sentCount: number;
  responseCount: number;
  softGateDismissed: boolean;
  hardGateReached: boolean;
  lastScenario: DemoScenarioId | 'unmatched' | null;
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

/** Result contract a demo transport returns. A real backend adapter implements the same shape. */
export type DemoReply =
  | {type: 'answer'; text: string; scenario: DemoScenarioId; source: 'sample'}
  | {type: 'unmatched'}
  | {type: 'refusal'}
  | {type: 'daily-limit'}
  | {type: 'session-expired'};
