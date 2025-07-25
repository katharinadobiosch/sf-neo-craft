import './configurator.scss';

const glassColorMap = {
  'gold-indigo': '#d5c89f',
  'blue-orange': '#b17852',
  'pink-green': '#d48cb2',
  'cyan-Magenta': '#7ec2ce',
  'silver-lilac': '#d6d4db',
  clear: '#e0e0e0',
};

const metalColorMap = {
  steel: '#d4d4d4',
  brass: '#a38a4b',
};

export function Configurator({productOptions, navigate}) {
  const getMappedColor = (name) =>
    glassColorMap[name] || metalColorMap[name] || null;

  const renderOption = (option) => {
    const isColorOption =
      option.name === 'Glass coating' ||
      option.name === 'Metal surfaces & cable colour';
    const label =
      option.name === 'Glass coating'
        ? 'Color Glass'
        : option.name === 'Metal surfaces & cable colour'
          ? 'Color Metal'
          : option.name;

    return (
      <>
        <div className="configurator-options-group" key={option.name}>
          <h5>{label}</h5>
          <div className="configurator-options-grid">
            {option.optionValues.map((value) => (
              <button
                key={value.name}
                className={`configurator-options-item${value.selected ? ' selected' : ''}`}
                style={{
                  border: value.selected
                    ? '0.1rem solid black'
                    : '0.1rem solid transparent',
                  opacity: value.available ? 1 : 0.3,
                }}
                disabled={!value.exists}
                onClick={() => {
                  if (!value.selected) {
                    navigate(`?${value.variantUriQuery}`, {
                      replace: true,
                      preventScrollReset: true,
                    });
                  }
                }}
              >
                {isColorOption ? (
                  <div
                    className="configurator-options-label-swatch"
                    style={{
                      backgroundColor: getMappedColor(value.name),
                    }}
                    aria-label={value.name}
                  />
                ) : (
                  value.name.replace('ø ', '')
                )}
              </button>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="configurator">
      <div className="configurator-columns">
        <div className="configurator-label-column">
          <h3>Configurator</h3>
          <div>X</div>
        </div>
        <div className="configurator-options-column">
          {productOptions.map(renderOption)}
        </div>
      </div>
    </div>
  );
}
