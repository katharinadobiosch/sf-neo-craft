import './configurator.scss';
import {useMemo} from 'react';

// Swatch-Farbzuordnung (fallback-neutral wenn kein Treffer)
const glassColorMap = {
  'gold-indigo': '#d5c89f',
  'blue-orange': '#b17852',
  'pink-green': '#d48cb2',
  'cyan-magenta': '#7ec2ce',
  'silver-lilac': '#d6d4db',
  clear: '#e0e0e0',
  bronze: '#b08d57', // grober Bronze-Fallback für "bronze ... glass"
};
const metalColorMap = {steel: '#d4d4d4', brass: '#a38a4b'};

const money = (num, currency = 'EUR') =>
  new Intl.NumberFormat(undefined, {style: 'currency', currency}).format(
    Number(num || 0),
  );

// z.B. "Metal surfaces & cable colour" -> "metal surfaces cable colour"
const normalize = (s = '') =>
  s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w]+/g, ' ')
    .trim();

const isGlassOptionName = (name) => {
  const n = normalize(name);
  return /(glass|coating)/.test(n);
};
const isMetalOptionName = (name) => {
  const n = normalize(name);
  return /(metal|colour base|color base|base)/.test(n);
};

// versucht, für einen Wertnamen eine Farbe zu finden
const mapSwatchColor = (valueName) => {
  const key = normalize(valueName);
  // exakte Treffer
  if (glassColorMap[key]) return glassColorMap[key];
  if (metalColorMap[key]) return metalColorMap[key];
  // heuristiken (z. B. "bronze satin glass" -> "bronze")
  if (/bronze/.test(key)) return glassColorMap['bronze'];
  if (/steel/.test(key)) return metalColorMap['steel'];
  if (/brass/.test(key)) return metalColorMap['brass'];
  if (/cyan.?magenta/.test(key)) return glassColorMap['cyan-magenta'];
  return null;
};

export function Configurator({product, productOptions, navigate}) {
  // 1) Aktuelle Auswahl je Option
  const selectedByOption = useMemo(() => {
    const map = {};
    for (const opt of productOptions) {
      const sel =
        opt.optionValues.find((v) => v.selected) || opt.optionValues[0];
      map[opt.name] = sel?.name;
    }
    return map;
  }, [productOptions]);

  // 2) Aktuelle Variante: nimm den "variant" des aktuell selektierten Values irgendeiner Option
  //    (bei deinen Daten ist das immer die Kombi aus allen selections)
  const currentVariant = useMemo(() => {
    for (const opt of productOptions) {
      const sel = opt.optionValues.find((v) => v.selected);
      if (sel?.variant) return sel.variant;
    }
    // Fallback: first selectable, falls (theoretisch) noch nichts gewählt
    const first = productOptions[0]?.optionValues?.[0];
    return first?.variant || first?.firstSelectableVariant || null;
  }, [productOptions]);

  const currency =
    currentVariant?.price?.currencyCode ||
    product?.variants?.nodes?.[0]?.price?.currencyCode ||
    'EUR';
  const basePrice = Number(currentVariant?.price?.amount || 0);

  const renderOption = (option) => {
    const isGlass = isGlassOptionName(option.name);
    const isMetal = isMetalOptionName(option.name);
    const label = isGlass
      ? 'Color Glass'
      : isMetal
        ? 'Color Metal'
        : option.name;

    return (
      <div className="configurator-options-group" key={option.name}>
        <h5>{label}</h5>
        <div className="configurator-options-grid">
          {option.optionValues.map((value) => {
            const selected = !!value.selected;
            const disabled = !value.exists;
            const swatchColor =
              isGlass || isMetal ? mapSwatchColor(value.name) : null;

            return (
              <button
                key={value.name}
                className={`configurator-options-item${selected ? ' selected' : ''}`}
                style={{
                  border: selected
                    ? '0.1rem solid black'
                    : '0.1rem solid transparent',
                  opacity: value.available ? 1 : 0.3,
                }}
                disabled={disabled}
                onClick={() => {
                  if (!selected) {
                    navigate(`?${value.variantUriQuery}`, {
                      replace: true,
                      preventScrollReset: true,
                    });
                  }
                }}
                aria-pressed={selected}
                title={value.name}
              >
                {(isGlass || isMetal) && swatchColor ? (
                  <div
                    className="configurator-options-label-swatch"
                    style={{backgroundColor: swatchColor}}
                    aria-label={value.name}
                  />
                ) : (
                  // Bei Größen hübsch "ø 25" etc. belassen
                  value.name
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="configurator">
      <div className="configurator-columns">
        <div className="configurator-label-column">
          <h3>Configurator</h3>

          {/* Preisbox */}
          <div className="configurator-price">
            <div className="configurator-price-label">Gesamt</div>
            <div className="configurator-price-value">
              {money(basePrice, currency)}
            </div>
            {currentVariant && !currentVariant.availableForSale && (
              <div className="configurator-price-hint">Nicht verfügbar</div>
            )}
          </div>
        </div>

        <div className="configurator-options-column">
          {productOptions.map(renderOption)}
        </div>
      </div>
    </div>
  );
}
