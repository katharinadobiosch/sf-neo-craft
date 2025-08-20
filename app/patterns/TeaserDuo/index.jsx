export function TeaserDuo({teaserImageLeft, teaserImageRight, content}) {
  const renderImage = (image) => {
    if (typeof image === 'string') {
      return <img src={image} alt="" />;
    }
    return image;
  };

  return (
    <div className="teaser-duo">
      <div className="teaser-duo__images">
        <div className="teaser-duo__image">{renderImage(teaserImageLeft)}</div>
        <div className="teaser-duo__image">{renderImage(teaserImageRight)}</div>
      </div>
      <div className="teaser-duo__content">
        <p>{content}</p>
      </div>
    </div>
  );
}
