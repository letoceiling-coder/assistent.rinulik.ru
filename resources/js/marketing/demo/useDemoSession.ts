import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {track} from '../analytics/track';
import {createSession, loadSession, saveSession} from './storage';
import {liveTransport, type DemoHistoryItem, type DemoTransport} from './transport';
import type {ChatMessageData, DemoRequestState, DemoScenarioId, DemoSession, DemoView, RetryPayload} from './types';

/** Spec §21: four messages without registration; soft gate after the 3rd answer, hard gate on the 5th send. */
export const DEMO_MESSAGE_LIMIT = 4;
export const SOFT_GATE_AFTER_RESPONSES = 3;


let messageSeq = 0;
const newMessage = (author: ChatMessageData['author'], text: string, note?: string): ChatMessageData => ({
  id: `m-${Date.now().toString(36)}-${(messageSeq += 1)}`,
  author,
  text,
  note,
});

/** Only the visitor ↔ Scrooty conversation goes to the server (never system notes). */
function toHistory(messages: readonly ChatMessageData[]): DemoHistoryItem[] {
  return messages
    .filter(m => m.author === 'customer' || m.author === 'scrooty')
    .map(m => ({role: m.author === 'customer' ? 'user' : 'assistant', content: m.text}));
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
export function useDemoSession(transport: DemoTransport = liveTransport) {
  const [session, setSession] = useState<DemoSession>(loadSession);
  const [request, setRequest] = useState<DemoRequestState>({type: 'idle'});
  const [draft, setDraft] = useState('');
  const [chosenScenario, setChosenScenario] = useState<{id: DemoScenarioId; prompt: string} | null>(null);
  const mounted = useRef(true);

  useEffect(() => saveSession(session), [session]);
  useEffect(() => () => { mounted.current = false; }, []);

  const view = deriveDemoView(session, request, draft);
  const busy = request.type === 'sending' || request.type === 'typing';

  const chooseScenario = useCallback((id: DemoScenarioId, prompt: string) => {
    setDraft(prompt);
    setChosenScenario({id, prompt});
  }, []);

  /** Asks the server for an answer to a visitor message that is already in the conversation. */
  const deliver = useCallback(async (payload: RetryPayload, history: DemoHistoryItem[]) => {
    // The typing indicator is real: it is shown for exactly as long as the request is in flight.
    setRequest({type: 'typing'});
    let reply;
    try {
      reply = await transport.send({history, scenario: payload.scenario, messageNumber: payload.messageNumber});
    } catch {
      if (mounted.current) setRequest({type: 'error', reason: 'network-error', retry: payload});
      track('demo_response_received', {status: 'error'});
      return;
    }
    if (!mounted.current) return;

    switch (reply.type) {
      case 'answer': {
        const {text, remaining} = reply;
        setSession(s => {
          const responseCount = s.responseCount + 1;
          if (responseCount === SOFT_GATE_AFTER_RESPONSES && !s.softGateDismissed) {
            track('demo_gate_seen', {gate_type: 'soft', message_count: s.sentCount});
          }
          return {
            ...s,
            messages: [...s.messages, newMessage('scrooty', text)],
            responseCount,
            serverRemaining: remaining,
            lastScenario: payload.scenario,
          };
        });
        setRequest({type: 'idle'});
        track('demo_response_received', {status: 'sample'});
        return;
      }
      case 'demo-limit':
        // The server says this session is used up: show the hard gate, drop the unanswered message.
        setSession(s => ({...s, messages: s.messages.slice(0, -1), sentCount: DEMO_MESSAGE_LIMIT, serverRemaining: 0, hardGateReached: true}));
        setRequest({type: 'idle'});
        track('demo_gate_seen', {gate_type: 'hard', message_count: payload.messageNumber});
        return;
      case 'daily-limit':
        setRequest({type: 'error', reason: 'daily-limit'});
        track('demo_gate_seen', {gate_type: 'daily_limit', message_count: payload.messageNumber});
        return;
      case 'rate-limited':
      case 'unavailable':
        setRequest({type: 'error', reason: reply.type, retry: payload});
        track('demo_response_received', {status: 'error'});
        return;
      case 'session-expired':
        setRequest({type: 'error', reason: 'session-expired'});
        return;
    }
  }, [transport]);

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

    const visitorMessage = newMessage('customer', text);
    const history = toHistory([...session.messages, visitorMessage]);
    setSession(s => ({...s, messages: [...s.messages, visitorMessage], sentCount: s.sentCount + 1}));
    setDraft('');
    setChosenScenario(null);
    void deliver({text, scenario, messageNumber}, history);
  }, [busy, chosenScenario, deliver, session.messages, session.sentCount]);

  const retry = useCallback(() => {
    // The unanswered visitor message is the last one in the conversation: resend the same history.
    if (request.type === 'error' && request.retry) void deliver(request.retry, toHistory(session.messages));
  }, [deliver, request, session.messages]);

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
    remaining: session.serverRemaining ?? Math.max(0, DEMO_MESSAGE_LIMIT - session.sentCount),
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
