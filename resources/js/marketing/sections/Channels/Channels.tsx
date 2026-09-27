import {useState} from 'react';
import {ButtonLink} from '../../components/Button/Button';
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
    customer: 'Здравствуйте! Ещё продаёте? Можно посмотреть в субботу?',
    answer: 'Здравствуйте! Уточню у менеджера время показа на субботу. Вам удобнее до обеда или после?',
  },
  telegram: {
    source: 'Telegram-бот компании',
    customer: 'Как записаться на консультацию?',
    answer: 'Помогу записаться. Какой вопрос хотите обсудить и в какие дни вам удобно?',
  },
  max: {
    source: 'Бизнес-бот в MAX',
    customer: 'Добрый день! Вы работаете в выходные?',
    answer: 'Добрый день! Подскажите, какой вопрос хотите решить — сразу скажу, когда и как это сделать.',
  },
  site: {
    source: 'Виджет на сайте',
    customer: 'Хочу понять, подойдёт ли нам ваше решение.',
    answer: 'Помогу разобраться. Сколько обращений в день вы получаете и из каких каналов?',
  },
};

/** Homepage Section 03 — channel proof (spec §10). */
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
      <div className="mk-split">
        <div>
          <SectionHeader
            id="channels-title"
            eyebrow="ОДИН МЕНЕДЖЕР · НЕСКОЛЬКО КАНАЛОВ"
            title="Scrooty отвечает там, где начинаются ваши продажи."
            description="Подключите нужные каналы и управляйте логикой одного AI-менеджера из общего кабинета."
          />
          <ul role="list" className="mk-channels__list">
            {channels.map(c => (
              <li key={c.id}>
                <a href={routePath(c.routeId)} className="mk-glass mk-lift mk-channels__link" data-channel={c.id}>
                  <span className="mk-channels__name">Scrooty для {c.id === 'site' ? 'сайта' : c.name}</span>
                  <span className={`mk-pill mk-pill--${c.status}`}>{statusLabel[c.status]}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="mk-microcopy mk-channels__micro">Доступность конкретного подключения зависит от аккаунта и требований канала.</p>
        </div>

        <div className="mk-window mk-glass mk-glass--elevated mk-channels__hub" data-channel={active}>
          <div className="mk-window__bar">
            <span>Диалоги · один AI-менеджер</span>
            <span className="mk-window__caption">Пример диалога</span>
          </div>
          <div className="mk-channels__tabs">
            <Tabs
              label="Канал"
              idPrefix="channels"
              variant="underline"
              items={channels.map(c => ({id: c.id, label: c.name}))}
              value={active}
              onChange={setActive}
            />
          </div>
          <div {...tabPanelProps('channels', active)} className="mk-window__body mk-channels__panel">
            <div className="mk-channels__source">
              <span className="mk-channels__badge">{channel.name}</span>
              <span className="mk-signal-line mk-signal-line--h mk-channels__signal" aria-hidden="true"/>
              <span className="mk-channels__scrooty">Scrooty</span>
            </div>
            <p className="mk-row__meta">{scene.source}</p>
            <ol role="list" className="mk-channels__thread">
              <ChatMessage author="customer" text={scene.customer}/>
              <ChatMessage author="scrooty" text={scene.answer}/>
            </ol>
            <div className="mk-channels__foot">
              <span className={`mk-pill mk-pill--${channel.status}`}>{statusLabel[channel.status]}</span>
              <span className="mk-row__meta">{channel.note}</span>
            </div>
            <ButtonLink variant="text" href={routePath(channel.routeId)}>Посмотреть решения для {channel.id === 'site' ? 'сайта' : channel.name}</ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  );
}
