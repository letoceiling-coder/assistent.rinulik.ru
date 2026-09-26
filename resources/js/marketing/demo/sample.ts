// STATIC PREVIEW CONTENT — not an API result and not a live AI response.
// Shown in the hero DemoShell (labelled «Пример диалога») until the live demo (Stage 05) exists.
import type {ChatMessageData, DemoScenario} from './types';

/** Illustrative exchange: a short customer question and a human-sounding answer with one follow-up question. */
export const sampleConversation: readonly ChatMessageData[] = [
  {id: 'sample-1', author: 'customer', text: 'Здравствуйте! Подскажите, есть доставка?'},
  {
    id: 'sample-2',
    author: 'scrooty',
    text: 'Здравствуйте! Да, доставляем. Подскажите, в какой город нужно доставить — сразу сориентирую по срокам и стоимости.',
  },
];

/** Suggestion chips (spec §18 scenario selectors). Prompts are visitor questions, inserted into the input only. */
export const demoScenarios: readonly DemoScenario[] = [
  {id: 'my-business', label: 'Мой бизнес', samplePrompt: 'У меня небольшой бизнес. Как Scrooty будет отвечать моим клиентам?'},
  {id: 'avito', label: 'Avito', samplePrompt: 'Клиент пишет на Avito: «Ещё актуально?» Что ответит Scrooty?'},
  {id: 'site', label: 'Сайт', samplePrompt: 'Как Scrooty поможет посетителю сайта оставить заявку?'},
  {id: 'handoff', label: 'Передача менеджеру', samplePrompt: 'Когда Scrooty передаёт диалог менеджеру?'},
];
