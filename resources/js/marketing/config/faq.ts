// FAQ content. Answers describe the product as it exists in this repository (see config/integrations.ts),
// with no legal, uptime or automation guarantees.
import {dialogDefinition} from './pricing';

export type FaqItem = {id: string; question: string; answer: string};

export const homeFaq: readonly FaqItem[] = [
  {id: 'no-code', question: 'Нужно ли программировать?', answer: 'Нет. Менеджер настраивается в кабинете за три шага: задача, стиль общения, знания. Для канала нужен токен вашего бота.'},
  {id: 'answers-source', question: 'Откуда Scrooty берёт ответы?', answer: 'Из ваших материалов: PDF, DOC, DOCX, TXT, Markdown или текста. Если данных нет — уточняет или передаёт менеджеру, а не придумывает.'},
  {id: 'channels', question: 'Какие каналы можно подключить?', answer: 'Сейчас — Telegram и MAX. Avito и виджет для сайта готовятся к запуску.'},
  {id: 'handoff', question: 'Что, если нужен человек?', answer: 'Диалог переходит к менеджеру вместе с контекстом, а сотрудник получает уведомление в Telegram. Условия передачи задаёте вы.'},
  {id: 'trial', question: 'Сколько стоит?', answer: 'От 2 490 ₽ в месяц. Первые 7 дней бесплатно, карта не нужна.'},
  {id: 'dialog', question: 'Что считается диалогом?', answer: dialogDefinition},
  {id: 'demo', question: 'Можно попробовать без регистрации?', answer: 'Да, 4 сообщения в демо на этой странице. Демо работает без вашей базы знаний, поэтому ответы общие.'},
];

export const pricingFaq: readonly FaqItem[] = [
  {id: 'dialog', question: 'Что считается диалогом?', answer: dialogDefinition},
  {id: 'trial', question: 'Нужна ли карта для пробного периода?', answer: 'Нет. 7 дней бесплатно доступны во всех тарифах без привязки карты.'},
  {id: 'annual', question: 'Чем отличается оплата за год?', answer: 'При оплате за год вы платите за 10 месяцев вместо 12. Итоговая сумма за год всегда указана рядом с ценой.'},
  {id: 'change', question: 'Можно сменить тариф позже?', answer: 'Да. Начните с тарифа под текущий объём обращений и перейдите на следующий, когда диалогов станет больше.'},
  {id: 'enterprise', question: 'Что входит в Enterprise?', answer: 'Индивидуальные лимиты, интеграции и условия поддержки. Условия обсуждаются отдельно.'},
];

export const partnerFaq: readonly FaqItem[] = [
  {id: 'own-price', question: 'Можно брать свою цену за внедрение?', answer: 'Да. 100% оплаты за внедрение, настройку и сопровождение остаётся вам.'},
  {id: 'who-leads', question: 'Кто ведёт клиента?', answer: 'Зависит от уровня: на уровне Referral вы приводите клиента, на уровне Integrator и выше — сами ведёте настройку и первую линию.'},
  {id: 'when-paid', question: 'Когда начисляется комиссия?', answer: 'После оплаты клиентом подписки и окончания периода удержания. Точные правила фиксации и выплат раскрываются до регистрации в программе.'},
  {id: 'white-label', question: 'Будет ли white label?', answer: 'White label есть в планах развития программы, но пока недоступен.'},
];
