import {TeaserDuo} from '../TeaserDuo';
import {HeroSplit_Poster} from '../HeroSplit';

import bespokeImageLeft from './bespokeImageLeft.jpg';
import bespokeImageRight from './bespokeImageRight.jpg';
import bespokeHeroImage from './bespokeHero.jpg';

export default function Bespoke() {
  return (
    <div className="bespoke">
      <TeaserDuo
        left={bespokeImageLeft}
        right={bespokeImageRight}
        content="NEO CRAFT is a Berlin-based furniture label founded by designer Sebastian Scherer in 2015 , dedicated to blending traditional craftsmanship with modern production techniques. The label challenges conventional ideas about materials, form, and function, reinterpreting them to create innovative and unexpected designs. At the heart of NEO/CRAFT lies a distinctive approach to material exploration and development processes. While the current focus is on metal, glass, and wood, the pursuit of new directions and fresh perspectives remains a fundamental part of NEO/CRAFT's ethos."
      />
      <HeroSplit_Poster
        // left={bespokeImageLeft}
        // right={bespokeHeroImage}
        // content="GOBA is about simplicity with character—a piece that invites interaction and creates presence without overwhelming the space."
        graphicColor="#F6A94A"
        quote="“GOBA is about simplicity with character—a piece that invites interaction and creates presence without overwhelming the space.”"
        rightImg={bespokeHeroImage}
      />
    </div>
  );
}
