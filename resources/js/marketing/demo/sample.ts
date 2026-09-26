// PREPARED DEMO CONTENT — not API results and not live AI responses.
// Used by the scenario sandbox until an anonymous demo endpoint exists
// (docs/scrooty/frontend-backend-todo.md). The UI labels this content as a demo/example.
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

/** Scenario selectors (spec §18). Prompts are inserted into the input only; answers are prepared text. */
export const demoScenarios: readonly DemoScenario[] = [
  {
    id: 'my-business',
    label: 'Мой бизнес',
    samplePrompt: 'У меня небольшой бизнес. Как Scrooty будет отвечать моим клиентам?',
    sampleAnswer:
      'Я отвечаю по материалам вашей компании: прайсу, FAQ, условиям доставки и записи. Задаю один уточняющий вопрос за раз, собираю нужные данные и передаю менеджеру готовый контекст. Чем занимается ваш бизнес?',
  },
  {
    id: 'avito',
    label: 'Avito',
    samplePrompt: 'Клиент пишет на Avito: «Ещё актуально?» Что ответит Scrooty?',
    sampleAnswer:
      'Отвечу сразу и по делу: сверюсь с данными, которые вы добавили, подтвержу актуальность и задам следующий вопрос — например, когда удобно посмотреть или куда доставить. Если данных нет, не придумываю, а подключаю менеджера.',
  },
  {
    id: 'site',
    label: 'Сайт',
    samplePrompt: 'Как Scrooty поможет посетителю сайта оставить заявку?',
    sampleAnswer:
      'На сайте я начинаю разговор с посетителем: отвечаю на вопросы по базе знаний, уточняю задачу и предлагаю оставить контакт. Заявка вместе с сутью разговора уходит вашей команде.',
  },
  {
    id: 'handoff',
    label: 'Передача менеджеру',
    samplePrompt: 'Когда Scrooty передаёт диалог менеджеру?',
    sampleAnswer:
      'Когда срабатывает условие, которое вы задали: клиент готов оплатить, просит индивидуальные условия или спрашивает то, чего нет в знаниях. Менеджер получает не просто уведомление, а суть разговора и собранные данные.',
  },
];

/** Shown when free text does not match a prepared scenario. Honest about the sandbox. */
export const unmatchedNote =
  'Это демо на готовых сценариях: здесь Scrooty не генерирует ответы. Выберите один из примеров ниже, а свой вопрос проверьте в тестовом чате после регистрации.';

export const sampleAnswerNote = 'Пример ответа';

/** Error copy (spec §18). */
export const demoErrorCopy = {
  'network-error': 'Не удалось получить ответ. Сообщение сохранено, попробуйте ещё раз.',
  'safety-refusal': 'С этим запросом Scrooty не поможет. Можно проверить обычный клиентский сценарий.',
  'session-expired': 'Демо-сессия устарела. Начните разговор заново.',
  'daily-limit': 'На сегодня демо закончилось. Создайте бесплатный аккаунт, чтобы продолжить.',
} as const;
