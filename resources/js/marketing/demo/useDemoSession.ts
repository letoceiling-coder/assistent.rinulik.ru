import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {track} from '../analytics/track';
import {demoErrorCopy, sampleAnswerNote, unmatchedNote} from './sample';
import {createSession, loadSession, saveSession} from './storage';
import {sandboxTransport, type DemoTransport} from './transport';
import type {ChatMessageData, DemoRequestState, DemoScenarioId, DemoSession, DemoView, RetryPayload} from './types';

/** Spec §21: four messages without registration; soft gate after the 3rd answer, hard gate on the 5th send. */
export const DEMO_MESSAGE_LIMIT = 4;
export const SOFT_GATE_AFTER_RESPONSES = 3;

/** Interface-only pause so the answer does not snap in. Not a simulation of network latency. */
const TYPING_PREVIEW_MS = 700;

let messageSeq = 0;
const newMessage = (author: ChatMessageData['author'], text: string, note?: string): ChatMessageData => ({
  id: `m-${Date.now().toString(36)}-${(messageSeq += 1)}`,
  author,
  text,
  note,
});

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function deriveDemoView(session: DemoSession, request: DemoRequestState, draft: string): DemoView {
  if (request.type === 'sending' || request.type === 'typing') return request.type;
  if (request.type === 'error') return request.reason;
  if (session.hardGateReached) return 'hard-gate';
  if (session.responseCount >= SOFT_GATE_AFTER_RESPONSES && session.responseCount < DEMO_MESSAGE_LIMIT && !session.softGateDismissed) {
    return 'soft-gate';
  }
  if (draft.trim()) return 'editing';
  return session.responseCount > 0 ? 'complete' : 'idle';
}

/**
 * Anonymous demo session: one focused hook, no global store.
 * Owns the conversation, counters, draft and request lifecycle; the transport decides where answers come from.
 */
export function useDemoSession(transport: DemoTransport = sandboxTransport) {
  const [session, setSession] = useState<DemoSession>(loadSession);
  const [request, setRequest] = useState<DemoRequestState>({type: 'idle'});
  const [draft, setDraft] = useState('');
  const [chosenScenario, setChosenScenario] = useState<{id: DemoScenarioId; prompt: string} | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => saveSession(session), [session]);
  useEffect(() => () => timers.current.forEach(t => window.clearTimeout(t)), []);

  const view = deriveDemoView(session, request, draft);
  const busy = request.type === 'sending' || request.type === 'typing';

  const chooseScenario = useCallback((id: DemoScenarioId, prompt: string) => {
    setDraft(prompt);
    setChosenScenario({id, prompt});
  }, []);

  /** Asks the transport for an answer to an already-recorded visitor message. */
  const deliver = useCallback(async (payload: RetryPayload) => {
    setRequest({type: 'sending'});
    let reply;
    try {
      reply = await transport.send({sessionId: session.id, ...payload});
    } catch {
      setRequest({type: 'error', reason: 'network-error', retry: payload});
      track('demo_response_received', {status: 'error'});
      return;
    }

    if (reply.type === 'daily-limit' || reply.type === 'session-expired') {
      setRequest({type: 'error', reason: reply.type});
      if (reply.type === 'daily-limit') track('demo_gate_seen', {gate_type: 'daily_limit', message_count: payload.messageNumber});
      return;
    }

    setRequest({type: 'typing'});
    const finish = () => {
      setSession(s => {
        const answer =
          reply.type === 'answer' ? newMessage('scrooty', reply.text, sampleAnswerNote)
          : reply.type === 'refusal' ? newMessage('system', demoErrorCopy['safety-refusal'])
          : newMessage('system', unmatchedNote);
        const responseCount = s.responseCount + 1;
        if (responseCount === SOFT_GATE_AFTER_RESPONSES && !s.softGateDismissed) {
          track('demo_gate_seen', {gate_type: 'soft', message_count: s.sentCount});
        }
        return {
          ...s,
          messages: [...s.messages, answer],
          responseCount,
          lastScenario: reply.type === 'answer' ? reply.scenario : 'unmatched',
        };
      });
      setRequest({type: 'idle'});
      track('demo_response_received', {status: reply.type === 'answer' ? 'sample' : 'fallback'});
    };
    const delay = prefersReducedMotion() ? 0 : TYPING_PREVIEW_MS;
    timers.current.push(window.setTimeout(finish, delay));
  }, [session.id, transport]);

  const send = useCallback((rawText: string) => {
    const text = rawText.trim();
    if (!text || busy) return;

    if (session.sentCount >= DEMO_MESSAGE_LIMIT) {
      setSession(s => ({...s, hardGateReached: true}));
      track('demo_gate_seen', {gate_type: 'hard', message_count: session.sentCount});
      return;
    }

    // A chip's scenario applies only while its prompt is unedited.
    const scenario = chosenScenario && chosenScenario.prompt === text ? chosenScenario.id : null;
    const messageNumber = session.sentCount + 1;
    if (messageNumber === 1) {
      track('demo_started', {scenario: scenario ?? 'free_text', entry_page: window.location.pathname});
    }
    track('demo_message_sent', {message_number: messageNumber, scenario: scenario ?? 'free_text'});

    setSession(s => ({...s, messages: [...s.messages, newMessage('customer', text)], sentCount: s.sentCount + 1}));
    setDraft('');
    setChosenScenario(null);
    void deliver({text, scenario, messageNumber});
  }, [busy, chosenScenario, deliver, session.sentCount]);

  const retry = useCallback(() => {
    if (request.type === 'error' && request.retry) void deliver(request.retry);
  }, [deliver, request]);

  const dismissSoftGate = useCallback(() => setSession(s => ({...s, softGateDismissed: true})), []);
  const dismissError = useCallback(() => setRequest({type: 'idle'}), []);
  const restart = useCallback(() => {
    setSession(createSession());
    setRequest({type: 'idle'});
    setDraft('');
  }, []);

  return useMemo(() => ({
    session,
    view,
    draft,
    setDraft,
    busy,
    remaining: Math.max(0, DEMO_MESSAGE_LIMIT - session.sentCount),
    started: session.messages.length > 0,
    chooseScenario,
    send,
    retry,
    dismissSoftGate,
    dismissError,
    restart,
  }), [session, view, draft, busy, chooseScenario, send, retry, dismissSoftGate, dismissError, restart]);
}

export type DemoSessionApi = ReturnType<typeof useDemoSession>;
