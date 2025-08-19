export function ProductMetaAccordion({metafields}) {
  console.log('metafields', metafields);

  const norm = (s = '') => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  // --- Eingabe vereinheitlichen & säubern ---
  const flat = Array.isArray(metafields?.edges)
    ? metafields.edges.map((e) => e?.node).filter(Boolean)
    : Array.isArray(metafields)
      ? metafields.filter(Boolean)
      : [];

  // Nix da? dann gar nichts rendern
  if (!flat.length) return null;

  // Reihenfolge/Labels + Keys (wie zuvor)
  const MF_DEFS = [
    {label: 'Material', keys: ['material']},
    {label: 'Metal Finish', keys: ['metalfinish']},
    {
      label: 'Metal Colour',
      keys: ['metalcolour', 'metalcolor', 'metal_color', 'metal_colour'],
    },
    {
      label: 'Cable Colour',
      keys: ['cablecolour', 'cablecolor', 'cable_color', 'cable_colour'],
    },
    {label: 'Frame Colour', keys: ['framecolour', 'framecolor', 'frame_color']},
    {label: 'Glass Colour', keys: ['glasscolour', 'glasscolor']},
    {label: 'Ceiling Cap', keys: ['ceilingcap', 'canopy']},
    {label: 'Dichroic Glass', keys: ['dichroicglass', 'dichroic']},
    {label: 'Table Top', keys: ['tabletop', 'table_top']},
    {label: 'Plug Type', keys: ['plugtype', 'plug']},
    {
      label: 'OLED Exchange Panel',
      keys: ['oledexchangepanel', 'oledexchange', 'oledpanel'],
    },
    {label: 'Option', keys: ['option']},
    {label: 'Surcharge', keys: ['surcharge']},
    {label: 'Size', keys: ['size']},
    {label: 'Length', keys: ['length'], unit: ' cm'},
    {label: 'Width', keys: ['width'], unit: ' cm'},
    {label: 'Height', keys: ['height'], unit: ' cm'},
    {label: 'Diameter', keys: ['diameter'], unit: ' cm'},
    {label: 'Marble Fixture', keys: ['marblefixture']},
    {label: 'Mirror Glass Type', keys: ['mirrorglasstype']},
    {label: 'Wood Type', keys: ['woodtype']},
    {label: 'Marble Type', keys: ['marbletype']},
  ];

  // Index für schnelle Suche
  const byKey = new Map();
  for (const mf of flat) {
    const k = mf?.key ? norm(mf.key) : null;
    if (k) byKey.set(k, mf);
    if (mf?.namespace && mf?.key)
      byKey.set(norm(`${mf.namespace}.${mf.key}`), mf);
    if (mf?.definition?.name) byKey.set(norm(mf.definition.name), mf);
  }

  const isNumberType = (t = '') => /number|integer|decimal/i.test(t);

  const formatVal = (mf, unit = '') => {
    if (!mf) return '';
    const raw = `${mf.value ?? ''}`.trim();
    if (!raw) return '';
    return unit && isNumberType(mf.type) ? `${raw}${unit}` : raw;
  };

  const items = MF_DEFS.map((def) => {
    const mf = def.keys
      .map((k) => byKey.get(k))
      .find((m) => m && `${m.value ?? ''}`.trim() !== '');
    if (!mf) return null;
    return {label: def.label, value: formatVal(mf, def.unit)};
  }).filter(Boolean);

  if (!items.length) return null;

  return (
    <div className="meta-accordion" role="region" aria-label="Product details">
      {items.map(({label, value}) => (
        <details key={label} className="acc-item">
          <summary>
            <span className="acc-title">{label}</span>
            <span className="acc-icon" aria-hidden>
              +
            </span>
          </summary>
          <div className="acc-panel">
            <p>{value}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
