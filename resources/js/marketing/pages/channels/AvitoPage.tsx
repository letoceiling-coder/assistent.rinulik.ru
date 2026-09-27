import {ButtonLink} from '../../components/Button/Button';
import {productLinks} from '../../config/navigation';
import {routePath} from '../../config/routes';
import {PageHero} from '../../components/PageHero/PageHero';
import {Faq} from '../../sections/Faq/Faq';
import {FinalCta} from '../../sections/FinalCta/FinalCta';
import {CardGrid, ChannelStatus, ChatPreview, PricingTeaser, SplitSection, StepsSection} from './ChannelBlocks';

const faq = [
  {id: 'status', question: 'Можно подключить Avito уже сейчас?', answer: 'Подключение Avito готовится к запуску: для него нужен подтверждённый доступ к API сообщений Avito. Пока можно настроить менеджера, знания и проверить ответы в тестовом чате.'},
  {id: 'ad-context', question: 'Откуда Scrooty знает детали объявления?', answer: 'Из материалов, которые вы добавили в базу знаний: описаний товаров и услуг, условий доставки и оплаты. Если данных нет, Scrooty не придумывает, а подключает менеджера.'},
  {id: 'contacts', question: 'Scrooty собирает контакты клиентов?', answer: 'Только если клиент сам готов их оставить: Scrooty предлагает удобный способ связи и передаёт его менеджеру вместе с сутью разговора.'},
  {id: 'handoff', question: 'Как менеджер узнаёт о готовом покупателе?', answer: 'Обращение появляется в разделе «Лиды», а сотрудник может получить уведомление в Telegram.'},
];

/** /avito-ai (spec §13). No zero-ban, official-status or automatic contact extraction claims. */
export function AvitoPage() {
  return (
    <>
      <PageHero
        eyebrow="Scrooty ДЛЯ AVITO"
        title="Клиент написал в Avito. Scrooty отвечает, пока интерес ещё горячий."
        body={<p>Scrooty знает контекст объявления, отвечает на частые вопросы, уточняет детали и передаёт менеджеру подготовленное обращение.</p>}
        actions={<>
          <ButtonLink variant="primary" size="lg" href={productLinks.register}>Создать AI-менеджера</ButtonLink>
          <ButtonLink variant="secondary" size="lg" href={`${routePath('demo')}?scenario=avito`}>Проверить в демо</ButtonLink>
        </>}
        note={<ChannelStatus id="avito"/>}
        visual={<ChatPreview title="Сообщение по объявлению" messages={[
          {author: 'customer', text: 'Здравствуйте! Ещё актуально? Торг возможен?'},
          {author: 'scrooty', text: 'Здравствуйте! По цене лучше уточнить у менеджера — передам ему ваш вопрос. Скажите, когда вам удобно посмотреть: сегодня или завтра?'},
        ]}/>}
      />

      <SplitSection
        id="avito-pain"
        tone="mixed"
        eyebrow="ПОЧЕМУ ЭТО ВАЖНО"
        title="Пока вы отвечали, клиент уже договорился с другим."
        description="На объявления пишут сразу нескольким продавцам. Первый понятный ответ часто решает, к кому покупатель придёт."
        visual={<ChatPreview title="Первые минуты после сообщения" messages={[
          {author: 'customer', text: 'Можно забрать сегодня вечером?'},
          {author: 'scrooty', text: 'Да, вечером можно. Подскажите, во сколько удобно — передам менеджеру, чтобы он подтвердил время.'},
        ]}/>}
      />

      <CardGrid
        id="avito-flow"
        eyebrow="ЧТО ДЕЛАЕТ Scrooty"
        title="От первого вопроса до подготовленного обращения."
        items={[
          {title: 'Отвечает по объявлению', text: 'Использует описания товаров, условия доставки и оплаты из вашей базы знаний.'},
          {title: 'Уточняет детали', text: 'Задаёт один вопрос за раз: количество, сроки, способ получения.'},
          {title: 'Предлагает оставить контакт', text: 'Только с согласия клиента — и передаёт его менеджеру вместе с сутью разговора.'},
          {title: 'Сообщает команде', text: 'Обращение появляется в «Лидах», сотрудник получает уведомление в Telegram.'},
        ]}
        columns={4}
      />

      <StepsSection
        id="avito-setup"
        tone="mixed"
        eyebrow="ЗАПУСК"
        title="Как будет устроено подключение."
        steps={['Создайте AI-менеджера и добавьте знания о товарах и условиях.', 'Проверьте ответы в тестовом чате кабинета.', 'Подключите аккаунт Avito, когда интеграция станет доступна.', 'Задайте правила передачи менеджеру.']}
        note="Подключение Avito появится после подтверждения доступа к API сообщений. До этого всё остальное можно подготовить заранее."
      />

      <PricingTeaser/>
      <Faq id="avito-faq" items={faq} title="Вопросы про Avito." eyebrow="AVITO" tone="surface" aside={<ButtonLink variant="text" href={routePath('demo')}>Спросить в демо</ButtonLink>}/>
      <FinalCta/>
    </>
  );
}
