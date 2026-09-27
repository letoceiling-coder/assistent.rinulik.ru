// Static demo content: the idle-state example conversation (labelled «Пример диалога») and the
// suggestion prompts. Live answers come from the demo endpoint, never from this file.
import type {ChatMessageData, DemoScenario} from './types';

/** Idle-state illustration: a short customer question and a human-sounding answer with one follow-up question. */
export const sampleConversation: readonly ChatMessageData[] = [
  {id: 'sample-1', author: 'customer', text: 'Здравствуйте! Подскажите, есть доставка?'},
  {
    id: 'sample-2',
    author: 'scrooty',
    text: 'Здравствуйте! Да, доставляем. Подскажите, в какой город нужно доставить — сразу сориентирую по срокам и стоимости.',
  },
];

/** Scenario selectors (spec §18). Prompts are inserted into the input only and never sent automatically. */
export const demoScenarios: readonly DemoScenario[] = [
  {
    id: 'my-business',
    label: 'Мой бизнес',
    samplePrompt: 'У меня небольшой бизнес. Как Scrooty будет отвечать моим клиентам?',
  },
  {
    id: 'avito',
    label: 'Avito',
    samplePrompt: 'Клиент пишет на Avito: «Ещё актуально?» Что ответит Scrooty?',
  },
  {
    id: 'site',
    label: 'Сайт',
    samplePrompt: 'Как Scrooty поможет посетителю сайта оставить заявку?',
  },
  {
    id: 'handoff',
    label: 'Передача менеджеру',
    samplePrompt: 'Когда Scrooty передаёт диалог менеджеру?',
  },
];

/** Error copy (spec §18). */
export const demoErrorCopy = {
  'network-error': 'Не удалось получить ответ. Сообщение сохранено, попробуйте ещё раз.',
  'rate-limited': 'Слишком много сообщений подряд. Подождите минуту и попробуйте снова.',
  unavailable: 'Демо сейчас не отвечает. Попробуйте чуть позже или проверьте Scrooty в тестовом чате после регистрации.',
  'session-expired': 'Демо-сессия устарела. Начните разговор заново.',
  'daily-limit': 'На сегодня демо закончилось. Создайте бесплатный аккаунт, чтобы продолжить.',
} as const;
