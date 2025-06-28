import './teaserDuo.scss';

export function TeaserDuo() {
  return (
    <div className="teaser-duo">
      <div className="teaser-duo__image-container">
        <img
          src="https://via.placeholder.com/150"
          alt="Teaser"
          className="teaser-duo__image"
        />
        <img
          src="https://via.placeholder.com/150"
          alt="Teaser"
          className="teaser-duo__image"
        />
      </div>
      <div>
        <p>
          NEO CRAFT is a Berlin-based furniture label founded by designer
          Sebastian Scherer in 2015. It is dedicated to merging traditional
          craftsmanship with contemporary production techniques. NEO/CRAFT
          challenges conventional ideas of material, form, and function,
          reinterpreting them to create innovative and unexpected designs. At
          the heart of NEO/CRAFT lies a distinctive approach to material
          exploration and development. While the current focus is on metal,
          glass, and wood, the search for new directions and fresh perspectives
          remains a fundamental part of the brand’s philosophy.
        </p>
      </div>
    </div>
  );
}
