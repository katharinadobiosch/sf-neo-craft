import {TeaserDuo} from '../TeaserDuo';
import {HeroSplit} from '../HeroSplit';

import aboutImageLeft from './aboutImageLeft.jpg';
import aboutImageRight from './aboutImageRight.jpg';
import aboutHeroImage from './aboutHero.jpg';

export default function About() {
  return (
    <>
      <TeaserDuo
        teaserImageLeft={aboutImageLeft}
        teaserImageRight={aboutImageRight}
        content="NEO CRAFT is a Berlin-based furniture label founded by designer Sebastian Scherer in 2015 , dedicated to blending traditional craftsmanship with modern production techniques. The label challenges conventional ideas about materials, form, and function, reinterpreting them to create innovative and unexpected designs. At the heart of NEO/CRAFT lies a distinctive approach to material exploration and development processes. While the current focus is on metal, glass, and wood, the pursuit of new directions and fresh perspectives remains a fundamental part of NEO/CRAFT's ethos."
      />
      <HeroSplit
        imageLeftTop={aboutImageLeft}
        imageRight={aboutHeroImage}
        content="GOBA is about simplicity with character—a piece that invites interaction and creates presence without overwhelming the space."
      />
    </>
  );
}
