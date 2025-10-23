import {useMemo, useRef, useState, useEffect} from 'react';
import {AddToCartButton} from '~/patterns/Cart/AddToCartButton';
import {useAside} from '~/patterns/Aside';
import colors from './colors.json';

const hexToRgba = (hex) => {
  const h = hex.replace('#', '');
  const hasAlpha = h.length === 8;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = hasAlpha ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return {r, g, b, a};
};
const relLum = ({r, g, b}) => {
  const f = (u) => {
    u /= 255;
    return u <= 0.03928 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const needsChecker = (hex) => {
  const {r, g, b, a} = hexToRgba(hex);
  return a < 0.999 || relLum({r, g, b}) > 0.85; // transparent ODER sehr hell
};
const checkerBg = {
  backgroundImage: 'repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%)',
  backgroundSize: '10px 10px',
};

const getSwatchStyle = (name) => {
  const key = norm(name);

  // (optional) Gradients zuerst
  const g = gradients[key];
  if (g) {
    return {
      ...checkerBg,
      backgroundImage: `linear-gradient(135deg, ${g[0]}, ${g[1]})`,
    };
  }

  const hex = getHex(name);
  if (hex) {
    return needsChecker(hex)
      ? {
          ...checkerBg,
          backgroundColor: hex,
          boxShadow: 'inset 0 0 0 1px #cfcfcf',
        }
      : {backgroundColor: hex};
  }

  // Fallback
  return checkerBg;
};

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

const money = (num, currency = 'USD') =>
  new Intl.NumberFormat(undefined, {style: 'currency', currency}).format(
    Number(num || 0),
  );

// ---------- Component ----------
export function Configurator({productOptions, navigate}) {
  const {open: openAside} = useAside();

  // Accordion
  const [open, setOpen] = useState(true);
  const panelRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(0);
  useEffect(() => {
    if (open && panelRef.current) {
      setPanelHeight(panelRef.current.scrollHeight);
    }
  }, [open, productOptions]);
  useEffect(() => {
    const onResize = () => {
      if (open && panelRef.current)
        setPanelHeight(panelRef.current.scrollHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  // Aktuelle Variante
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
        ? 'Color Base'
        : 'Color Glass'
      : option.name;

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
    <div className={`configurator ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="cfg-toggle"
        aria-expanded={open}
        aria-controls="cfg-panel"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="cfg-title">Configurator</span>
        <span className="cfg-plus" aria-hidden />
      </button>

      <div
        id="cfg-panel"
        className="cfg-panel"
        style={{maxHeight: open ? panelHeight : 0}}
      >
        <div ref={panelRef} className="cfg-panel-inner">
          {productOptions?.map(renderOption)}
          <div className="cfg-cta">
            <span className="cta-arrow">→</span>
            <span className="cta-price">{money(price, currency)}</span>
            <div className="cta-button-wrap">
              <AddToCartButton
                disabled={!currentVariant || !currentVariant.availableForSale}
                onClick={() => openAside('cart')}
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
    </div>
  );
}
