import './heroSplit.scss';

export function HeroSplit({imageLeftTop, imageRight, content}) {
  return (
    <div className="hero-split">
      <div className="hero-split__left">
        <img src={imageLeftTop} alt="" />
        <p>{content}</p>
      </div>
      <div className="hero-split__right">
        <img src={imageRight} alt="" />
      </div>
    </div>
  );
}
