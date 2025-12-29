import {useRef, useState, useEffect} from 'react';
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

export function Configurator({
  productOptions,
  navigate,
  // 👇 neu – alle optional
  seriesProducts = [],
  seriesActiveIndex = 0,
  onChangeSeriesProduct,
}) {
  // Nur die Varianten-Sektion toggeln
  const [variantsOpen, setVariantsOpen] = useState(true);
  const panelRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(0);

  const variantOptions = productOptions || [];

  const hasSeriesOptions =
    Array.isArray(seriesProducts) &&
    seriesProducts.length > 1 &&
    typeof onChangeSeriesProduct === 'function';

  useEffect(() => {
    if (!variantsOpen) return;
    const id = requestAnimationFrame(() => {
      if (panelRef.current) {
        setPanelHeight(panelRef.current.scrollHeight || 0);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [variantsOpen, productOptions, seriesProducts, seriesActiveIndex]);

  useEffect(() => {
    const onResize = () => {
      if (variantsOpen && panelRef.current) {
        setPanelHeight(panelRef.current.scrollHeight || 0);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [variantsOpen]);

  const renderOption = (option) => {
    const colorish = isColorOption(option.name);

    const label = option.name.charAt(0).toUpperCase() + option.name.slice(1); // 👈 hier

    const optionSlug = option.name.toLowerCase().trim();
    const isModel = optionSlug === 'model' || optionSlug === 'modell';
    const isSize = optionSlug === 'size' || optionSlug === 'größe' || optionSlug === 'groesse';

    return (
      <div
        className={`cfg-row ${colorish ? 'cfg-row--color' : ''} ${!colorish ? 'cfg-row--chip' : ''} ${isModel ? 'cfg-row--model' : ''} ${isSize ? 'cfg-row--size' : ''}`}
        key={option.name}
      >
        <div className="cfg-label">{label}</div>
        <div
          className={`cfg-values ${colorish ? 'cfg-values--color' : 'cfg-values--chip'}`}
          data-option={optionSlug}
          data-count={!colorish ? option.optionValues.length : undefined}
        >
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
    <div className="configurator" data-variants-open={variantsOpen}>
      {/* Kopf: toggelt NUR Varianten */}
      <div className="cfg-head">
        <button
          type="button"
          className="cfg-toggle"
          aria-expanded={variantsOpen}
          aria-controls="cfg-variants"
          onClick={() => setVariantsOpen((v) => !v)}
        >
          <span className="cfg-title">Configurator</span>
          <span
            className={`cfg-plus ${variantsOpen ? 'is-open' : ''}`}
            aria-hidden="true"
          />
        </button>
        <div className="cfg-head__label" />
        <div className="cfg-head__values" />
      </div>

      {/* Container 1: Varianten */}
      <div
        id="cfg-variants"
        className="cfg-panel"
        style={{maxHeight: variantsOpen ? panelHeight : 0}}
      >
        <div ref={panelRef} className="cfg-panel-inner">
          {/* 🔹 neue Modell-Zeile */}
          {hasSeriesOptions && (
            <div className="cfg-row cfg-row--model">
              <div className="cfg-label">Model</div>
              <div className="cfg-values">
                {seriesProducts.map((p, index) => {
                  const label = p.title.replace(/^OSOM\s+/i, '');
                  const isActive = index === seriesActiveIndex;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      className={`cfg-item is-chip ${isActive ? 'is-selected' : ''}`}
                      onClick={() => onChangeSeriesProduct(index)}
                    >
                      <span className="chip-text">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* bestehende Variant-Optionen */}
          {variantOptions.map(renderOption)}
        </div>
      </div>
    </div>
  );
}
