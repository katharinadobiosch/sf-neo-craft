import {TeaserDuo} from '../TeaserDuo';
import {
  HeroSplit_Poster,
  HeroSplit,
  HeroSplit_GalleryBand,
  HoverImage,
} from '../HeroSplit';

import teaserDuoRight from './London-craft-week-invite-2025-image.png';
import teaserDuoLeft from './NC_PP_LR_SteelStand_Ambience_01.png';
import heroSplitRight from './NC_LR_SteelStandTable_Mood_03.png';

import heroSplitLeft from './NC_OSOM_TALL_H45_CLEARGLASS_BRONZE_300dpi.png';

import teaserDuoLeftBottom from './NC_POLY_DROPSHADOW_01_72dpi.png';
import teaserDuoRightBottom from './NC_POLY_OBLONG_SATINGLASS_BRONZE_72dpi.png';

export default function Bespoke() {
  return (
    <div className="bespoke">
      <TeaserDuo
        left={teaserDuoLeft}
        right={teaserDuoRight}
        content="NEO CRAFT is a Berlin-based furniture label founded by designer Sebastian Scherer in 2015 , dedicated to blending traditional craftsmanship with modern production techniques. The label challenges conventional ideas about materials, form, and function, reinterpreting them to create innovative and unexpected designs. At the heart of NEO/CRAFT lies a distinctive approach to material exploration and development processes. While the current focus is on metal, glass, and wood, the pursuit of new directions and fresh perspectives remains a fundamental part of NEO/CRAFT's ethos."
      />

      <HeroSplit
        showDivider={true} // mittlere Linie
        bandDecor={null} // kein Farbbalken
        rightAspect="780/940" // rechts hochkant
        leftTopAspect="788/520" // links oben etwas breiter
        leftBottomAspect="788/420" // links unten flacher Block
        leftTop={<HoverImage image={heroSplitLeft} />}
        leftBottom={<div className="hs-spacer hs-spacer--light" />}
        right={<HoverImage image={heroSplitRight} />}
      />
      <TeaserDuo left={teaserDuoLeftBottom} right={teaserDuoRightBottom} />
    </div>
  );
}
