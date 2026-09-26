import {useEffect} from 'react';
import {Container} from '../components/Container';
import {useDemo} from '../demo/DemoProvider';
import {LiveDemo} from '../demo/LiveDemo';
import {demoScenarios} from '../demo/sample';
import './DemoPage.css';

/**
 * /demo (spec §18): distraction-free. Same demo engine and tab session as the homepage hero.
 * `?scenario=<id>` pre-fills the matching suggestion (never sends it).
 */
export function DemoPage() {
  const demo = useDemo();

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('scenario');
    const scenario = demoScenarios.find(s => s.id === id);
    if (scenario && !demo.draft) demo.chooseScenario(scenario.id, scenario.samplePrompt);
    // Runs once on page load only.
  }, []);

  return (
    <section className="mk-demo-page" aria-labelledby="page-title">
      <Container className="mk-demo-page__inner">
        <div className="mk-demo-page__intro">
          <h1 id="page-title" className="mk-display-l">Поговорите со Scrooty.</h1>
          <p className="mk-body-l mk-demo-page__body">Опишите свой бизнес или задайте вопрос о продукте. Первые четыре сообщения доступны без регистрации.</p>
        </div>
        <LiveDemo id="demo"/>
      </Container>
    </section>
  );
}
