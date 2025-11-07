import React from 'react';

export function TeaserDuo({
  teaserImageLeft,
  teaserImageLeftHover,
  teaserImageRight,
  teaserImageRightHover,
  content,
}) {
  const renderImagePair = (image, hoverImage) => {
    const isString = typeof image === 'string';
    const baseImg = isString ? <img src={image} alt="" /> : image;
    const hoverImg =
      hoverImage && typeof hoverImage === 'string' ? (
        <img src={hoverImage} alt="" className="hover-img" aria-hidden="true" />
      ) : (
        hoverImage
      );

    return (
      <div className="hover-wrap">
        {baseImg}
        {hoverImg}
      </div>
    );
  };

  return (
    <div className="teaser-duo">
      <div className="teaser-duo__images">
        <div className="teaser-duo__image">
          {renderImagePair(teaserImageLeft, teaserImageLeftHover)}
        </div>
        <div className="teaser-duo__image">
          {renderImagePair(teaserImageRight, teaserImageRightHover)}
        </div>
      </div>
      {content && (
        <div className="teaser-duo__content">
          <p>{content}</p>
        </div>
      )}
    </div>
  );
}
