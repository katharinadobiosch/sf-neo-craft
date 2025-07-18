import './teaserDuoHomepage.scss';

export function TeaserDuoHomepage({teaserImageLeft, teaserImageRight, content}) {
  return (
    <div className="teaser-duo-homepage">
      <div className="teaser-duo-homepage__image">
        <img src={teaserImageLeft} alt="" />
        <img src={teaserImageRight} alt="" />
      </div>
      <div className="teaser-duo-homepage__content">
        <p>{content}</p>
      </div>
    </div>
  );
}
