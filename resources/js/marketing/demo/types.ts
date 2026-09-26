// Demo domain types. Stage 05 adds the live demo state machine next to these.

export type ChatAuthor = 'customer' | 'scrooty';

export type ChatMessageData = {
  id: string;
  author: ChatAuthor;
  text: string;
};

/** Scenario selectors from spec §18. */
export type DemoScenarioId = 'my-business' | 'avito' | 'site' | 'handoff';

export type DemoScenario = {
  id: DemoScenarioId;
  label: string;
  /** Text a suggestion chip puts into the input. Never sent automatically. */
  samplePrompt: string;
};
