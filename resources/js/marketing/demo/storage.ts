// Tab-scoped persistence of the anonymous demo session (sessionStorage), so a refresh keeps the
// message count and conversation. Nothing leaves the browser. Storage failures degrade to memory.
import type {DemoSession} from './types';

const KEY = 'scrooty.demo.v1';

export function createSession(): DemoSession {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
  return {id, messages: [], sentCount: 0, responseCount: 0, softGateDismissed: false, hardGateReached: false, lastScenario: null};
}

export function loadSession(): DemoSession {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return createSession();
    const parsed = JSON.parse(raw) as Partial<DemoSession>;
    if (!parsed.id || !Array.isArray(parsed.messages) || typeof parsed.sentCount !== 'number') return createSession();
    return {...createSession(), ...parsed} as DemoSession;
  } catch {
    return createSession();
  }
}

export function saveSession(session: DemoSession): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // Private mode / quota: keep working in memory.
  }
}
