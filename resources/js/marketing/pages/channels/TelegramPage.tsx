import {ButtonLink} from '../../components/Button/Button';
import {PageHero} from '../../components/PageHero/PageHero';
import {productLinks} from '../../config/navigation';
import {routePath} from '../../config/routes';
import {Faq} from '../../sections/Faq/Faq';
import {FinalCta} from '../../sections/FinalCta/FinalCta';
import {CardGrid, ChannelStatus, ChatPreview, PricingTeaser, SplitSection, StepsSection} from './ChannelBlocks';

const faq = [
  {id: 'bot', question: 'Нужен свой Telegram-бот?', answer: 'Да. Scrooty подключается к вашему боту по токену, который выдаёт Telegram при создании бота. Клиенты пишут вашему боту, а отвечает AI-менеджер.'},
  {id: 'team', question: 'Как команда узнаёт о важных диалогах?', answer: 'Диалог можно передать менеджеру: он появляется со статусом «У менеджера», а заявка — в разделе «Лиды». Уведомления о новых лидах можно получать в Telegram.'},
  {id: 'knowledge', question: 'На чём основаны ответы?', answer: 'На материалах, которые вы добавили: документах PDF, DOC, DOCX, TXT, Markdown или тексте. Если нужной информации нет, Scrooty не придумывает.'},
  {id: 'test', question: 'Можно проверить до подключения?', answer: 'Да. В кабинете есть тестовый чат: проверьте ответы на своих вопросах, прежде чем подключать бота.'},
];

/** /telegram-ai (spec §14). Telegram channel is available in the product. */
export function TelegramPage() {
  return (
    <>
      <PageHero
        eyebrow="Scrooty ДЛЯ TELEGRAM"
        title="Telegram отвечает клиенту сразу. Даже когда команда занята."
        body={<p>Подключите Telegram-бота к знаниям и действиям бизнеса. Scrooty ведёт первый разговор, а ваша команда подключается к важным случаям.</p>}
        actions={<>
          <ButtonLink variant="primary" size="lg" href={productLinks.register}>Создать AI-менеджера</ButtonLink>
          <ButtonLink variant="secondary" size="lg" href={routePath('demo')}>Посмотреть демо</ButtonLink>
        </>}
        note={<ChannelStatus id="telegram"/>}
        visual={<ChatPreview title="Telegram-бот компании" messages={[
          {author: 'customer', text: 'Добрый вечер! Можно записаться на пятницу?'},
          {author: 'scrooty', text: 'Добрый вечер! Помогу. Какая услуга нужна и в какое время удобно? Передам запись администратору.'},
        ]}/>}
      />

      <CardGrid
        id="telegram-scenarios"
        tone="mixed"
        eyebrow="СЦЕНАРИИ"
        title="Что Scrooty берёт на себя в Telegram."
        items={[
          {title: 'Заявки', text: 'Уточняет задачу и контакт, фиксирует обращение в «Лидах».'},
          {title: 'Частые вопросы', text: 'Отвечает по прайсу, условиям и инструкциям из базы знаний.'},
          {title: 'Поддержка', text: 'Решает типовые вопросы и передаёт сложные сотруднику.'},
          {title: 'Продажи', text: 'Помогает выбрать и ведёт клиента к следующему шагу.'},
        ]}
        columns={4}
      />

      <SplitSection
        id="telegram-handoff"
        eyebrow="КОМАНДА НА СВЯЗИ"
        title="Важные диалоги не теряются в потоке."
        description="Когда срабатывает правило передачи, сотрудник видит суть разговора и собранные данные, а не просто «вам новое сообщение»."
        visual={<ChatPreview title="Передача менеджеру" messages={[
          {author: 'customer', text: 'Хочу обсудить оптовые условия для нашей сети.'},
          {author: 'scrooty', text: 'Понял, это лучше обсудить с менеджером. Передаю ему ваш запрос — он напишет вам здесь же.'},
        ]}/>}
      />

      <StepsSection
        id="telegram-setup"
        tone="mixed"
        eyebrow="ПОДКЛЮЧЕНИЕ"
        title="Запуск в Telegram — в несколько шагов."
        steps={['Создайте AI-менеджера: задача, стиль общения, знания.', 'Проверьте ответы в тестовом чате.', 'Создайте бота в Telegram и скопируйте его токен.', 'Вставьте токен в разделе «Интеграции» кабинета.']}
      />

      <PricingTeaser/>
      <Faq id="telegram-faq" items={faq} title="Вопросы про Telegram." eyebrow="TELEGRAM" tone="surface"/>
      <FinalCta/>
    </>
  );
}
