import {ButtonLink} from '../../components/Button/Button';
import {PageHero} from '../../components/PageHero/PageHero';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {productLinks} from '../../config/navigation';
import {routePath} from '../../config/routes';
import {Faq} from '../../sections/Faq/Faq';
import {FinalCta} from '../../sections/FinalCta/FinalCta';
import {CardGrid, ChannelStatus, ChatPreview, StepsSection} from './ChannelBlocks';

const faq = [
  {id: 'who', question: 'Кто может подключить бота в MAX?', answer: 'Бот создаётся после подключения к платформе MAX для партнёров, верификации профиля организации, ИП или самозанятого и прохождения модерации.'},
  {id: 'what', question: 'Что Scrooty делает в MAX?', answer: 'Отвечает на вопросы клиентов по вашей базе знаний, собирает нужные данные и передаёт обращения сотрудникам.'},
  {id: 'miniapps', question: 'Поддерживаются мини-приложения MAX?', answer: 'Нет. Scrooty работает с сообщениями бизнес-бота.'},
];

/** /max-ai (spec §15). Claim boundary: verified business profile + moderation required; no one-click setup. */
export function MaxPage() {
  return (
    <>
      <PageHero
        eyebrow="Scrooty ДЛЯ MAX"
        title="AI-менеджер для клиентов в MAX."
        body={<p>Подключите Scrooty к бизнес-боту MAX, чтобы отвечать на вопросы, собирать данные и передавать обращения сотрудникам.</p>}
        actions={<>
          <ButtonLink variant="primary" size="lg" href={productLinks.register}>Создать AI-менеджера</ButtonLink>
          <ButtonLink variant="secondary" size="lg" href={routePath('demo')}>Посмотреть демо</ButtonLink>
        </>}
        note={<>
          <p className="mk-max-required">Для запуска нужен подтверждённый профиль бизнеса и модерация бота в MAX.</p>
          <ChannelStatus id="max"/>
        </>}
        visual={<ChatPreview title="Бизнес-бот в MAX" messages={[
          {author: 'customer', text: 'Здравствуйте! Как оформить возврат?'},
          {author: 'scrooty', text: 'Здравствуйте! Расскажу по шагам. Подскажите номер заказа или дату покупки — проверю, что нужно для возврата.'},
        ]}/>}
      />

      <Section id="max-now" labelledBy="max-now-title" tone="surface">
        <SectionHeader id="max-now-title" eyebrow="ЧТО РАБОТАЕТ СЕЙЧАС" title="Диалоги с клиентами в бизнес-боте MAX."/>
        <ul role="list" className="mk-checks mk-max-list">
          <li>Ответы по вашей базе знаний</li>
          <li>Уточняющие вопросы и сбор данных</li>
          <li>Передача диалога сотруднику со статусом «У менеджера»</li>
          <li>Обращения в разделе «Лиды» и уведомления в Telegram</li>
        </ul>
      </Section>

      <CardGrid
        id="max-cases"
        eyebrow="СЦЕНАРИИ"
        title="Где MAX-бот со Scrooty полезен."
        items={[
          {title: 'Вопросы о товарах и услугах', text: 'Ответы по прайсу и условиям без ожидания сотрудника.'},
          {title: 'Запись и заявки', text: 'Сбор деталей и контакта для следующего шага.'},
          {title: 'Поддержка', text: 'Типовые вопросы — сразу, сложные — сотруднику.'},
        ]}
      />

      <StepsSection
        id="max-setup"
        tone="surface"
        eyebrow="ПОДКЛЮЧЕНИЕ"
        title="Как запустить Scrooty в MAX."
        steps={['Подключитесь к платформе MAX для партнёров и верифицируйте профиль бизнеса.', 'Создайте бота и пройдите модерацию.', 'Создайте AI-менеджера в Scrooty и проверьте ответы в тестовом чате.', 'Добавьте токен бота в разделе «Интеграции».']}
        note="Scrooty не может ускорить верификацию или модерацию в MAX — эти шаги проходят на стороне платформы."
      />

      <Faq id="max-faq" items={faq} title="Ограничения и вопросы." eyebrow="MAX"/>
      <FinalCta/>
    </>
  );
}
