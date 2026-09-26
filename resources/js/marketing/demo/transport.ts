// Demo transport contract + the scenario sandbox implementation.
// The sandbox makes NO network requests: it matches the visitor's text to a prepared scenario.
// A backend adapter (future anonymous demo API) implements the same DemoTransport interface.
import {demoScenarios} from './sample';
import type {DemoReply, DemoScenarioId} from './types';

export type DemoRequest = {
  sessionId: string;
  text: string;
  /** Scenario explicitly chosen via a suggestion chip, if the text was not edited. */
  scenario: DemoScenarioId | null;
  messageNumber: number;
};

export interface DemoTransport {
  send(request: DemoRequest): Promise<DemoReply>;
}

const keywordRules: ReadonlyArray<[DemoScenarioId, RegExp]> = [
  ['avito', /avito|авито/i],
  ['handoff', /менеджер|переда|человек|оператор|сотрудник/i],
  ['site', /сайт|виджет|заявк|посетител/i],
  ['my-business', /бизнес|компан|клиент|магазин|салон|услуг|товар|доставк/i],
];

export function matchScenario(text: string): DemoScenarioId | null {
  return keywordRules.find(([, rule]) => rule.test(text))?.[0] ?? null;
}

export const sandboxTransport: DemoTransport = {
  async send({text, scenario}) {
    const id = scenario ?? matchScenario(text);
    const match = demoScenarios.find(s => s.id === id);
    return match ? {type: 'answer', text: match.sampleAnswer, scenario: match.id, source: 'sample'} : {type: 'unmatched'};
  },
};
