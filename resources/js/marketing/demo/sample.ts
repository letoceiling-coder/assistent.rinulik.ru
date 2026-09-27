// Static demo content: the idle-state example conversation (labelled «Пример диалога») and the
// suggestion prompts. Live answers come from the demo endpoint, never from this file.
import type {ChatMessageData, DemoScenario} from './types';

/** Idle-state preview (one short exchange). Replaced by the real conversation on the first message. */
export const sampleConversation: readonly ChatMessageData[] = [
  {id: 'sample-1', author: 'customer', text: 'Есть доставка в Казань?'},
  {id: 'sample-2', author: 'scrooty', text: 'Да. Напишите район или адрес — подскажу условия доставки.'},
];

/** Chips: short labels, full prompts. Inserted into the input only; never sent automatically. */
export const demoScenarios: readonly DemoScenario[] = [
  {id: 'coffee', label: 'Кофейня', samplePrompt: 'У меня кофейня. Гость спрашивает: «Вы доставляете?» Как ответит Scrooty?'},
  {id: 'beauty', label: 'Салон красоты', samplePrompt: 'У меня салон красоты. Клиент пишет: «Хочу записаться на стрижку». Что ответит Scrooty?'},
  {id: 'avito', label: 'Avito', samplePrompt: 'Клиент пишет на Avito: «Ещё актуально?» Что ответит Scrooty?'},
  {id: 'handoff', label: 'Передача человеку', samplePrompt: 'Когда Scrooty передаёт диалог человеку?'},
];

/** Error copy (spec §18). */
export const demoErrorCopy = {
  'network-error': 'Не удалось получить ответ. Сообщение сохранено, попробуйте ещё раз.',
  'rate-limited': 'Слишком часто. Подождите минуту.',
  unavailable: 'Демо сейчас не отвечает. Попробуйте чуть позже.',
  'session-expired': 'Сессия устарела. Начните заново.',
  'daily-limit': 'На сегодня демо закончилось. Создайте бесплатный аккаунт, чтобы продолжить.',
} as const;
