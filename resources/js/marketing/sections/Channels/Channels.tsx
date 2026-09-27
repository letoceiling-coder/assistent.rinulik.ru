import {useState} from 'react';
import {ChannelIcon} from '../../components/ChannelIcon/ChannelIcon';
import {ChatMessage} from '../../components/ChatMessage/ChatMessage';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {Tabs, tabPanelProps} from '../../components/Tabs/Tabs';
import {homeAnchors} from '../../config/navigation';
import {channels, statusLabel, type ChannelId} from '../../config/integrations';
import {routePath} from '../../config/routes';
import './Channels.css';

/** Per-channel illustration: the same manager, a different source context. Example content, labelled as such. */
const channelScenes: Record<ChannelId, {source: string; customer: string; answer: string}> = {
  avito: {
    source: 'Сообщение по объявлению',
    customer: 'Ещё продаёте? Можно посмотреть в субботу?',
    answer: 'Да, в наличии. Вам удобнее до обеда или после?',
  },
  telegram: {
    source: 'Telegram-бот компании',
    customer: 'Как записаться на консультацию?',
    answer: 'Помогу. Какой день вам удобен?',
  },
  max: {
    source: 'Бизнес-бот в MAX',
    customer: 'Добрый день! Вы работаете в выходные?',
    answer: 'Добрый день! Да, в субботу до 18:00. Записать вас?',
  },
  site: {
    source: 'Виджет на сайте',
    customer: 'Подойдёт ли нам ваше решение?',
    answer: 'Расскажите, откуда приходят клиенты, — подскажу.',
  },
};

/** Homepage — channel hub: one manager, one context, four sources. */
export function Channels() {
  const [active, setActive] = useState<ChannelId>('avito');
  const channel = channels.find(c => c.id === active)!;
  const scene = channelScenes[active];

  return (
    <Section
      id={homeAnchors.features.id}
      labelledBy="channels-title"
      tone="cool"
      className="mk-channels"
      backdrop={
        // Per-channel Scrooty signal atmosphere (section colours, not the channels' own brand colours); crossfades.
        <div className="mk-channels__atmos" data-channel={active} aria-hidden="true">
          {channels.map(c => <span key={c.id} data-for={c.id}/>)}
        </div>
      }
    >
      <SectionHeader id="channels-title" align="center" title="Один менеджер. Один контекст."/>

      <div className="mk-window mk-glass mk-glass--elevated mk-channels__hub" data-channel={active}>
        <div className="mk-channels__tabs">
          <Tabs
            label="Канал"
            idPrefix="channels"
            items={channels.map(c => ({id: c.id, label: c.name}))}
            value={active}
            onChange={setActive}
          />
        </div>
        <div {...tabPanelProps('channels', active)} className="mk-channels__panel">
          <div className="mk-channels__source" aria-hidden="true">
            <span className="mk-channels__badge"><ChannelIcon id={channel.id} size={16}/>{channel.name}</span>
            <span className="mk-signal-line mk-signal-line--h mk-channels__signal"/>
            <span className="mk-channels__scrooty">Scrooty</span>
          </div>
          <p className="mk-visually-hidden">{scene.source}</p>
          <ol role="list" className="mk-channels__thread">
            <ChatMessage author="customer" text={scene.customer}/>
            <ChatMessage author="scrooty" text={scene.answer}/>
          </ol>
          <div className="mk-channels__foot">
            <span className={`mk-pill mk-pill--${channel.status}`}>{statusLabel[channel.status]}</span>
            <a className="mk-channels__more" href={routePath(channel.routeId)}>Подробнее о&nbsp;{channel.id === 'site' ? 'сайте' : channel.name}</a>
          </div>
        </div>
      </div>
    </Section>
  );
}
