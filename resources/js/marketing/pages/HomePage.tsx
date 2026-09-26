import {Actions} from '../sections/Actions/Actions';
import {Channels} from '../sections/Channels/Channels';
import {Handoff} from '../sections/Handoff/Handoff';
import {Hero} from '../sections/Hero/Hero';
import {HowItWorks} from '../sections/HowItWorks/HowItWorks';
import {HumanProof} from '../sections/HumanProof/HumanProof';
import {Knowledge} from '../sections/Knowledge/Knowledge';

// Homepage (spec §10): composition only — each section owns its content and layout.
export function HomePage() {
  return (
    <>
      <Hero/>
      <Channels/>
      <HumanProof/>
      <HowItWorks/>
      <Knowledge/>
      <Actions/>
      <Handoff/>
    </>
  );
}
