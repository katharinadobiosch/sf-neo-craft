import './teaserDuoHomepage.scss';

export function TeaserDuoHomepage({teaserImageLeft, teaserImageRight, content}) {
  return (
    <div className="teaser-duo">
      <div className="teaser-duo__image">
        <img src={teaserImageLeft} alt="" />
        <img src={teaserImageRight} alt="" />
      </div>
      <div className="teaser-duo__content">
        <p>{content}</p>
      </div>
    </div>
  );
}
