import React from 'react';

export function TeaserDuo({
  left,
  right,
  leftHover,
  rightHover,
  altLeft = '',
  altRight = '',
  content,
  className,
}) {
  const ImgPair = ({base, hover, alt}) => (
    <div className="hover-wrap">
      <img src={base} alt={alt} className="base-img" loading="lazy" />
      {hover ? (
        <img
          src={hover}
          alt=""
          className="hover-img"
          aria-hidden="true"
          loading="lazy"
        />
      ) : null}
    </div>
  );

  return (
    <section
      className={['teaser-duo', className].filter(Boolean).join(' ')}
      aria-label="Teaser duo"
    >
      <div className="teaser-duo__images">
        <div className="teaser-duo__image">
          <ImgPair base={left} hover={leftHover} alt={altLeft} />
        </div>
        <div className="teaser-duo__image">
          <ImgPair base={right} hover={rightHover} alt={altRight} />
        </div>
      </div>
      {content ? <div className="teaser-duo__content">{content}</div> : null}
    </section>
  );
}
