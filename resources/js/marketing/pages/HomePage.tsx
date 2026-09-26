import {homeFaq} from '../config/faq';
import {Actions} from '../sections/Actions/Actions';
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
import {Trust} from '../sections/Trust/Trust';
import {UseCases} from '../sections/UseCases/UseCases';

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
      <Cabinet/>
      <UseCases/>
      <Trust/>
      <PricingPreview/>
      <PartnersTeaser/>
      <Faq items={homeFaq} aside={<p className="mk-microcopy">Для сложной интеграции можно написать команде после регистрации.</p>}/>
      <FinalCta/>
    </>
  );
}
