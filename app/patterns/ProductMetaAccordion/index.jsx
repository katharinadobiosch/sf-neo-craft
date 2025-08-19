// schlanke Konfig – nutze exakt die Keys aus deiner GraphQL-Query
const FIELD_CONFIG = [
  {key: 'metal_colour', label: 'Metal Colour'},
  {key: 'cable_colour', label: 'Cable Colour'},
  {key: 'plug_type', label: 'Plug Type'},
  {key: 'frame_colour', label: 'Frame Colour'},
  {key: 'glass_colour', label: 'Glass Colour'},
  {key: 'ceiling_cap', label: 'Ceiling Cap'},
  {key: 'dichroic_glass', label: 'Dichroic Glass'},
  {key: 'table_top', label: 'Table Top'},
  {key: 'material', label: 'Material'},
  {key: 'metal_finish', label: 'Metal Finish'},
  {key: 'size', label: 'Size'},
  {key: 'length', label: 'Length', unit: ' cm'},
  {key: 'width', label: 'Width', unit: ' cm'},
  {key: 'height', label: 'Height', unit: ' cm'},
  {key: 'diameter', label: 'Diameter', unit: ' cm'},
  {key: 'marble_fixture', label: 'Marble Fixture'},
  {key: 'mirror_glass_type', label: 'Mirror Glass Type'},
  {key: 'wood_type', label: 'Wood Type'},
  {key: 'marble_type', label: 'Marble Type'},
  {key: 'oled_exchange_panel', label: 'OLED Exchange Panel'},
  {key: 'option', label: 'Option'},
  {key: 'surcharge', label: 'Surcharge'},
];

// Hilfen
const norm = (s = '') => s.toLowerCase().replace(/[^a-z0-9._-]/g, '');
const isNumberType = (t = '') => /number|integer|decimal/i.test(t);
const isListType = (t = '') => t.startsWith('list.');

const formatVal = (mf, unit = '') => {
  let v = `${mf?.value ?? ''}`.trim();
  if (!v) return '';
  if (isListType(mf.type)) {
    try {
      const arr = JSON.parse(v);
      if (Array.isArray(arr)) v = arr.filter(Boolean).join(', ');
    } catch {}
  }
  if (unit && isNumberType(mf.type) && !Number.isNaN(Number(v)))
    return `${v}${unit}`;
  return v;
};

export function ProductMetaAccordion({metafields}) {
  // flatten
  const flat = Array.isArray(metafields) ? metafields.filter(Boolean) : [];
  if (!flat.length) return null;

  // index nach key & namespace.key
  const byKey = new Map();
  for (const mf of flat) {
    const k = norm(mf.key);
    if (k) byKey.set(k, mf);
    if (mf.namespace && mf.key)
      byKey.set(norm(`${mf.namespace}.${mf.key}`), mf);
  }

  // bekannte Felder in gewünschter Reihenfolge
  const used = new Set();
  const knownItems = FIELD_CONFIG.map((cfg) => {
    const mf = byKey.get(cfg.key) || byKey.get(`custom.${cfg.key}`);
    if (!mf) return null;
    const value = formatVal(mf, cfg.unit);
    if (!value) return null;
    used.add(mf);
    return {label: cfg.label, value};
  }).filter(Boolean);

  // unbekannte Felder (optional) hinten anhängen
  const unknownItems = flat
    .filter((mf) => !used.has(mf) && `${mf.value ?? ''}`.trim() !== '')
    .map((mf) => ({
      label: mf.key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: formatVal(mf),
    }));

  const items = [...knownItems, ...unknownItems];
  if (!items.length) return null;

  return (
    <div className="meta-accordion" role="region" aria-label="Product details">
      {items.map(({label, value}) => (
        <details key={label} className="acc-item">
          <summary>
            <span className="acc-title">{label}</span>
            <span className="acc-plus" aria-hidden />
          </summary>
          <div className="acc-panel">
            <p>{value}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
