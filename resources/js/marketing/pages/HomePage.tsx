import {homeFaq} from '../config/faq';
import {Cabinet} from '../sections/Cabinet/Cabinet';
import {Channels} from '../sections/Channels/Channels';
import {Faq} from '../sections/Faq/Faq';
import {FinalCta} from '../sections/FinalCta/FinalCta';
import {Handoff} from '../sections/Handoff/Handoff';
import {Hero} from '../sections/Hero/Hero';
import {HowItWorks} from '../sections/HowItWorks/HowItWorks';
import {HumanProof} from '../sections/HumanProof/HumanProof';
import {Knowledge} from '../sections/Knowledge/Knowledge';
import {PartnersTeaser} from '../sections/PartnersTeaser/PartnersTeaser';
import {PricingPreview} from '../sections/PricingPreview/PricingPreview';
import {UseCases} from '../sections/UseCases/UseCases';

// Homepage: composition only — one idea per screen; each section owns its content and layout.
export function HomePage() {
  return (
    <>
      <Hero/>
      <Channels/>
      <HumanProof/>
      <HowItWorks/>
      <Knowledge/>
      <Handoff/>
      <Cabinet/>
      <UseCases/>
      <PricingPreview/>
      <PartnersTeaser/>
      <Faq items={homeFaq} eyebrow="" title="Частые вопросы."/>
      <FinalCta/>
    </>
  );
}
