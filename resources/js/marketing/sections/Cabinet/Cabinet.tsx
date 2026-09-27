import {useState} from 'react';
import {ButtonLink} from '../../components/Button/Button';
import {Section} from '../../components/Section';
import {SectionHeader} from '../../components/SectionHeader';
import {Tabs, tabPanelProps} from '../../components/Tabs/Tabs';
import {productLinks} from '../../config/navigation';
import {routePath} from '../../config/routes';
import './Cabinet.css';

type TabId = 'managers' | 'knowledge' | 'dialogs' | 'leads' | 'integrations';

/**
 * Honest product UI illustrations built from the real cabinet structure and its status labels
 * (wizard «Задача → Общение → Знания», dialog statuses, lead statuses, channel states).
 * No connected customer data, no results: rows are labelled examples or empty states.
 */
function Panel({tab}: {tab: TabId}) {
  switch (tab) {
    case 'managers':
      return (
        <>
          <p className="mk-cabinet__lead">Новый AI-менеджер создаётся за три шага.</p>
          <ol role="list" className="mk-cabinet__wizard">
            <li className="is-done"><span>1</span>Задача<small>Цель и сценарий</small></li>
            <li className="is-current"><span>2</span>Общение<small>Стиль, приветствие, правила</small></li>
            <li><span>3</span>Знания<small>Документы и текст</small></li>
          </ol>
          <div className="mk-row"><span className="mk-row__main"><span className="mk-row__title">Менеджер для входящих</span><span className="mk-row__meta">Пример · черновик</span></span><span className="mk-pill mk-pill--planned">Черновик</span></div>
        </>
      );
    case 'knowledge':
      return (
        <ul role="list">
          <li className="mk-row"><span className="mk-row__main"><span className="mk-row__title">Условия доставки.docx</span><span className="mk-row__meta">Пример документа</span></span><span className="mk-pill mk-pill--available">Готово</span></li>
          <li className="mk-row"><span className="mk-row__main"><span className="mk-row__title">Частые вопросы</span><span className="mk-row__meta">Текст, добавленный вручную</span></span><span className="mk-pill mk-pill--processing">Обрабатывается</span></li>
          <li className="mk-row"><span className="mk-row__main"><span className="mk-row__title">Прайс-лист.pdf</span><span className="mk-row__meta">Пример документа</span></span><span className="mk-pill mk-pill--soon">В очереди</span></li>
        </ul>
      );
    case 'dialogs':
      return (
        <ul role="list">
          <li className="mk-row"><span className="mk-row__main"><span className="mk-row__title">Тестовый чат</span><span className="mk-row__meta">Проверка ответов перед запуском</span></span><span className="mk-pill mk-pill--available">Ассистент отвечает</span></li>
          <li className="mk-row"><span className="mk-row__main"><span className="mk-row__title">Диалог из канала</span><span className="mk-row__meta">Пример статуса после передачи</span></span><span className="mk-pill mk-pill--info">У менеджера</span></li>
          <li className="mk-row"><span className="mk-row__main"><span className="mk-row__title">Диалог завершён</span><span className="mk-row__meta">Пример статуса</span></span><span className="mk-pill mk-pill--planned">Закрыт</span></li>
        </ul>
      );
    case 'leads':
      return (
        <>
          <p className="mk-cabinet__lead">Обращения проходят понятные статусы.</p>
          <ul role="list" className="mk-cabinet__stages" aria-label="Статусы лида">
            {['Новый', 'Связались', 'Квалифицирован', 'Успешно', 'Закрыт'].map(s => <li key={s} className="mk-pill mk-pill--plain">{s}</li>)}
          </ul>
          <p className="mk-cabinet__empty">Готовых обращений пока нет. Они появятся после квалификации.</p>
        </>
      );
    case 'integrations':
      return (
        <ul role="list">
          <li className="mk-row"><span className="mk-row__main"><span className="mk-row__title">Telegram</span><span className="mk-row__meta">Токен бота</span></span><span className="mk-pill mk-pill--planned">Не подключено</span></li>
          <li className="mk-row"><span className="mk-row__main"><span className="mk-row__title">MAX</span><span className="mk-row__meta">Токен бизнес-бота</span></span><span className="mk-pill mk-pill--planned">Не подключено</span></li>
          <li className="mk-row"><span className="mk-row__main"><span className="mk-row__title">Уведомления в Telegram</span><span className="mk-row__meta">Сообщения о новых лидах</span></span><span className="mk-pill mk-pill--planned">Не подключено</span></li>
        </ul>
      );
  }
}

const tabs: ReadonlyArray<{id: TabId; label: string}> = [
  {id: 'managers', label: 'Менеджеры'},
  {id: 'knowledge', label: 'Знания'},
  {id: 'dialogs', label: 'Диалоги'},
  {id: 'leads', label: 'Лиды'},
  {id: 'integrations', label: 'Интеграции'},
];

/** Homepage Section 09 — one cabinet (spec §10). */
export function Cabinet() {
  const [active, setActive] = useState<TabId>('managers');
  return (
    <Section id="cabinet" labelledBy="cabinet-title">
      <SectionHeader
        id="cabinet-title"
        eyebrow="ОДИН КАБИНЕТ"
        title="Создайте, обучите, проверьте и запустите своего менеджера."
        description="Настройте роль и стиль, добавьте знания, протестируйте разговор, подключите каналы и следите за обращениями."
      />
      <div className="mk-cabinet__stage" data-reveal="scale-soft">
      <div className="mk-window mk-cabinet">
        <div className="mk-cabinet__tabs">
          <Tabs label="Раздел кабинета" idPrefix="cabinet" variant="underline" items={tabs} value={active} onChange={setActive}/>
          <span className="mk-window__caption mk-cabinet__caption">Иллюстрация интерфейса</span>
        </div>
        <div {...tabPanelProps('cabinet', active)} className="mk-window__body mk-cabinet__panel">
          <Panel tab={active}/>
        </div>
      </div>
      </div>
      <div className="mk-section-cta">
        <ButtonLink variant="secondary" href={productLinks.register}>Создать Scrooty</ButtonLink>
        <ButtonLink variant="text" href={routePath('demo')}>Попробовать демо</ButtonLink>
        <p className="mk-microcopy">Без кода для базового запуска.</p>
      </div>
    </Section>
  );
}
