import '.configurator.scss/';

export function ProductOptionSwatch({swatch, name}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="configurator-options-label-swatch"
      style={{backgroundColor: color || 'transparent'}}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}
