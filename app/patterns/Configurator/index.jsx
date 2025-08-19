import {useMemo} from 'react';
import {AddToCartButton} from '~/patterns/Cart/AddToCartButton';
import {useAside} from '~/patterns/Aside';
import {MediaGallery} from '~/patterns/MediaGallery';

import colors from './colors.json';

// ---------- Helpers ----------
const norm = (s = '') =>
  s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const isColorOption = (name) => {
  const n = norm(name);
  return (
    n.includes('glass') ||
    n.includes('metal') ||
    n.includes('colour base') ||
    n.includes('color base') ||
    n.includes('mirror')
  );
};

const gradients = {
  'gold-indigo': ['#d4af37', '#4b0082'],
  'blue-orange': ['#1e90ff', '#ff8c00'],
  'pink-green': ['#ff7aa2', '#6ccf84'],
  'cyan-magenta': ['#00bcd4', '#ff00a8'],
  'silver-lilac': ['#c0c0c0', '#c8a2c8'],
};

const getHex = (name) => {
  const lower = norm(name);
  const m = colors.find((c) => norm(c.name) === lower);
  return m?.hex || null;
};

const getSwatchStyle = (name) => {
  const hex = getHex(name);
  if (hex) return {backgroundColor: hex};
  const g = gradients[norm(name)];
  if (g) return {backgroundImage: `linear-gradient(135deg, ${g[0]}, ${g[1]})`};
  return {
    backgroundImage: 'repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%)',
    backgroundSize: '10px 10px',
  };
};

const money = (num, currency = 'USD') =>
  new Intl.NumberFormat(undefined, {style: 'currency', currency}).format(
    Number(num || 0),
  );

// ---------- Component ----------
export function Configurator({productOptions, navigate, product}) {
  const {open} = useAside(); // optional

  // Aktuelle Variante aus der Selektion ableiten (bei dir steckt sie in jedem selected optionValue.variant)
  const currentVariant = useMemo(() => {
    for (const opt of productOptions || []) {
      const sel = opt.optionValues?.find((v) => v.selected);
      if (sel?.variant) return sel.variant;
    }
    const first = productOptions?.[0]?.optionValues?.[0];
    return first?.variant || first?.firstSelectableVariant || null;
  }, [productOptions]);

  const currency = currentVariant?.price?.currencyCode || 'USD';
  const price = Number(currentVariant?.price?.amount || 0);

  const renderOption = (option) => {
    const colorish = isColorOption(option.name);
    const label = colorish
      ? norm(option.name).includes('metal') ||
        norm(option.name).includes('base')
        ? 'COLOR METAL'
        : 'COLOR GLASS'
      : option.name.toUpperCase();

    console.log(currentVariant?.title, currentVariant?.image?.id);

    return (
      <div className="cfg-row" key={option.name}>
        <div className="cfg-label">{label}</div>

        <div className="cfg-values">
          {option.optionValues.map((value) => {
            const selected = !!value.selected;
            const disabled = !value.exists;

            return (
              <button
                key={value.name}
                className={`cfg-item ${colorish ? 'is-color' : 'is-chip'} ${selected ? 'is-selected' : ''}`}
                disabled={disabled}
                title={value.name}
                onClick={() => {
                  if (!selected) {
                    navigate(`?${value.variantUriQuery}`, {
                      replace: true,
                      preventScrollReset: true,
                    });
                  }
                }}
                aria-pressed={selected}
              >
                {colorish ? (
                  <span className="dot-ring">
                    <span
                      className="dot"
                      style={getSwatchStyle(value.name)}
                      aria-label={value.name}
                    />
                  </span>
                ) : (
                  <span className="chip-text">
                    {value.name.replace('ø ', '')}
                  </span>
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
      <div className="cfg-head">
        <h3>Configurator</h3>
        <button className="cfg-close" aria-label="Close">
          ×
        </button>
      </div>

      <hr className="cfg-divider" />

      <div className="cfg-flex">
        {productOptions?.map(renderOption)}
        {/* CTA-Leiste nur in der linken Spalte */}
        <div className="cfg-cta">
          <span className="cta-arrow">→</span>
          <span className="cta-price">{money(price, currency)}</span>

          <div className="cta-button-wrap">
            <AddToCartButton
              disabled={!currentVariant || !currentVariant.availableForSale}
              onClick={() => open('cart')} // optional: Cart-Aside öffnen
              lines={
                currentVariant
                  ? [{merchandiseId: currentVariant.id, quantity: 1}]
                  : []
              }
            >
              {currentVariant?.availableForSale ? 'Add to Cart' : 'Sold out'}
            </AddToCartButton>
          </div>
        </div>
      </div>
    </div>
  );
}
