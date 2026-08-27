import {TeaserDuo} from '../TeaserDuo';
import {HeroSplit_Poster} from '../HeroSplit';
import {useRouteLoaderData} from 'react-router';

import duoLeft from './about-duo-left.jpg';
import duoRight from './about-duo-right.jpg';
import portraitLeft from './about-portrait-left.jpg';
import portraitRight from './about-portrait-right.jpg';

export default function About() {
  const rootData = useRouteLoaderData('root');
  const language = String(rootData?.consent?.language || 'EN').toUpperCase();

  const quote =
    language === 'DE'
      ? '„Gute Gestaltung ist für mich auch ein wenig Entertainment. Es muss nicht zwingend gefallen, aber es darf nicht langweilen.“'
      : '"To me, good design is also a bit of entertainment. It doesn\'t necessarily have to be appealing, but it shouldn\'t be boring."';

  return (
    <div className="about">
      <TeaserDuo
        left={duoLeft}
        right={duoRight}
        altLeft="NEO CRAFT production"
        altRight="Glass production"
        content="NEO CRAFT is a Berlin-based furniture label founded by designer Sebastian Scherer in 2015, dedicated to blending traditional craftsmanship with modern production techniques. The label challenges conventional ideas about materials, form, and function, reinterpreting them to create innovative and unexpected designs. At the heart of NEO/CRAFT lies a distinctive approach to material exploration and development processes. While the current focus is on metal, glass, and wood, the pursuit of new directions and fresh perspectives remains a fundamental part of NEO/CRAFT's ethos."
      />

      <HeroSplit_Poster
        quote={quote}
        rightImg={portraitRight}
        leftTop={
          <div className="about__portrait-left">
            <img src={portraitLeft} alt="Sebastian Scherer at work" />
          </div>
        }
      />
    </div>
  );
}
