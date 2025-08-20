export function HeroSplit({imageLeftTop, imageRight, content}) {
  return (
    <section className="hero-split" aria-label="Hero split">
      <div className="hero-split__left">
        <div className="hero-split__left-img">
          <img src={imageLeftTop} alt="" />
        </div>
        <div className="hero-split__quote">
          <div className="hero-split__quote-inner">
            GOBA balances sculptural clarity with subtle technology— bringing
            soft, responsive light into any space.
          </div>
        </div>
      </div>

      <div className="hero-split__right">
        <div className="hero-split__right-img">
          <img src={imageRight} alt="" />
        </div>
      </div>
    </section>
  );
}
