import {ButtonLink} from '../../components/Button/Button';
import {PageHero} from '../../components/PageHero/PageHero';
import {productLinks} from '../../config/navigation';
import {routePath} from '../../config/routes';
import {FinalCta} from '../../sections/FinalCta/FinalCta';
import {CardGrid, ChannelStatus, ChatPreview, PricingTeaser, SplitSection} from './ChannelBlocks';

/** /site-ai (spec §16). The site widget is not released yet: status is stated, installation is not promised. */
export function SitePage() {
  return (
    <>
      <PageHero
        eyebrow="Scrooty ДЛЯ САЙТА"
        title="Сайт может не только рассказывать. Он может начать разговор."
        body={<p>Добавьте на сайт AI-менеджера Scrooty. Он отвечает по базе знаний, уточняет запрос, создаёт лид и передаёт разговор сотруднику.</p>}
        actions={<>
          <ButtonLink variant="primary" size="lg" href={productLinks.register}>Создать AI-менеджера</ButtonLink>
          <ButtonLink variant="secondary" size="lg" href={`${routePath('demo')}?scenario=site`}>Проверить в демо</ButtonLink>
        </>}
        note={<ChannelStatus id="site"/>}
        visual={<ChatPreview title="Виджет на сайте" caption="Макет виджета" messages={[
          {author: 'scrooty', text: 'Здравствуйте! Помогу подобрать решение. Что вы хотите сделать?'},
          {author: 'customer', text: 'Нужен сайт для небольшой студии.'},
          {author: 'scrooty', text: 'Понял. Какие задачи у сайта важнее всего: запись клиентов, каталог или просто контакты?'},
        ]}/>}
      />

      <SplitSection
        id="site-first"
        tone="surface"
        eyebrow="НЕ ЧАТ ПОДДЕРЖКИ"
        title="Первый менеджер, который встречает каждого посетителя."
        description="Посетитель не ищет ответ по страницам и не ждёт обратного звонка: он сразу получает ответ и понятный следующий шаг."
        visual={<ChatPreview title="Посетитель уточняет условия" messages={[
          {author: 'customer', text: 'А сколько это стоит?'},
          {author: 'scrooty', text: 'Зависит от объёма. Расскажите в двух словах о задаче — сориентирую по стоимости и предложу созвон с менеджером.'},
        ]}/>}
      />

      <CardGrid
        id="site-flow"
        eyebrow="КАК ЭТО РАБОТАЕТ"
        title="От вопроса посетителя до заявки с контекстом."
        items={[
          {title: 'Отвечает по базе знаний', text: 'Условия, цены, сроки — из ваших документов, без выдуманных фактов.'},
          {title: 'Уточняет запрос', text: 'Один вопрос за раз, пока задача не станет понятной.'},
          {title: 'Собирает контакт', text: 'Когда посетитель готов, предлагает оставить удобный способ связи.'},
          {title: 'Передаёт сотруднику', text: 'Заявка с сутью разговора — в «Лидах», уведомление — в Telegram.'},
        ]}
        columns={4}
      />

      <PricingTeaser tone="surface"/>
      <FinalCta/>
    </>
  );
}
