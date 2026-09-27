// Demo transport: the live, rate-limited demo endpoint `POST /api/v1/demo/messages` (see DemoController).
// The server is the source of truth for limits; the client only mirrors them for the UI.
import type {DemoReply, DemoScenarioId} from './types';

export type DemoHistoryItem = {role: 'user' | 'assistant'; content: string};

export type DemoRequest = {
  /** Conversation of the current demo session, oldest first; the last item is the visitor's new message. */
  history: DemoHistoryItem[];
  /** Scenario chip used for this message (analytics only; not sent). */
  scenario: DemoScenarioId | null;
  messageNumber: number;
};

export interface DemoTransport {
  send(request: DemoRequest): Promise<DemoReply>;
}

function metaToken(): string {
  return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

async function refreshToken(): Promise<string> {
  const res = await fetch('/api/v1/csrf', {credentials: 'same-origin', headers: {Accept: 'application/json'}});
  const token = res.ok ? String((await res.json()).token ?? '') : '';
  const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
  if (meta && token) meta.content = token;
  return token;
}

const MAX_HISTORY = 10;

async function post(history: DemoHistoryItem[], token: string): Promise<Response> {
  return fetch('/api/v1/demo/messages', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token},
    body: JSON.stringify({messages: history.slice(-MAX_HISTORY)}),
  });
}

/** Throws only on network failure; every HTTP outcome maps to a DemoReply. */
export const liveTransport: DemoTransport = {
  async send({history}) {
    let res = await post(history, metaToken());
    if (res.status === 419) {
      // Expired CSRF token/session: refresh once and retry.
      res = await post(history, await refreshToken());
      if (res.status === 419) return {type: 'session-expired'};
    }
    const data = await res.json().catch(() => ({}));
    if (res.ok && typeof data.reply === 'string') {
      return {type: 'answer', text: data.reply, remaining: Number(data.remaining ?? 0)};
    }
    if (res.status === 403 && data.reason === 'demo_limit') return {type: 'demo-limit'};
    if (res.status === 429) return {type: data.reason === 'daily_limit' ? 'daily-limit' : 'rate-limited'};
    return {type: 'unavailable'};
  },
};
