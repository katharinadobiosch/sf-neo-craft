/* eslint-env node */
import fs from 'node:fs/promises';
import path from 'node:path';

const FILE = path.resolve('app/graphql/product/products-with-metafields.json');

const SERIES_KEY = 'custom.product_series';

const IMPORTANT_KEYS = [
  'custom.product_series',
  'custom.measurements',
  'custom.material',
  'custom.technical_specs',
  'custom.photometric_specs',
  'custom.electric_specs',
  'custom.certification',
  'custom.lead_time',
  'custom.shipping',
  'custom.configurator_addons',
  'custom.series_hero',
  'custom.product_tile',
  'custom.produkt_duo_top_links',
  'custom.produkt_duo_top_rechts',
  'custom.hero_split_links',
  'custom.hero_split_rechts',
  'custom.hero_split_text',
  'custom.teaser_duo_bottom_links',
  'custom.teaser_duo_bottom_rechts',
];

function hasValue(entry) {
  if (!entry) return false;
  const v = entry.value;
  if (v == null) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  return true;
}

function short(value, max = 80) {
  if (value == null) return '';
  const s = String(value).replace(/\s+/g, ' ').trim();
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

async function main() {
  const raw = await fs.readFile(FILE, 'utf8');
  const products = JSON.parse(raw);

  const keyStats = new Map();

  for (const product of products) {
    const metafields = product.metafields || {};
    for (const [key, entry] of Object.entries(metafields)) {
      if (!keyStats.has(key)) {
        keyStats.set(key, {
          key,
          count: 0,
          type: entry?.type || '',
          examples: [],
        });
      }
      const row = keyStats.get(key);
      row.count += 1;
      if (row.examples.length < 3 && hasValue(entry)) {
        row.examples.push(short(entry.value));
      }
    }
  }

  const allKeys = [...keyStats.values()].sort((a, b) => b.count - a.count);

  const withSeries = products.filter((p) =>
    hasValue(p.metafields?.[SERIES_KEY]),
  );
  const withoutSeries = products.filter(
    (p) => !hasValue(p.metafields?.[SERIES_KEY]),
  );

  const perProduct = products.map((p) => {
    const metafields = p.metafields || {};
    const summary = {
      title: p.title,
      handle: p.handle,
      productType: p.productType,
      hasSeries: hasValue(metafields[SERIES_KEY]),
      options: (p.options || []).map((o) => o.name),
      keys: Object.keys(metafields).sort(),
      important: {},
    };

    for (const key of IMPORTANT_KEYS) {
      if (hasValue(metafields[key])) {
        summary.important[key] = short(metafields[key].value, 120);
      }
    }

    return summary;
  });

  const coverage = IMPORTANT_KEYS.map((key) => ({
    key,
    productsWithValue: products.filter((p) => hasValue(p.metafields?.[key]))
      .length,
  }));

  const outDir = path.resolve('app/graphql/product');
  await fs.writeFile(
    path.join(outDir, 'analysis-all-keys.json'),
    JSON.stringify(allKeys, null, 2),
    'utf8',
  );

  await fs.writeFile(
    path.join(outDir, 'analysis-products-summary.json'),
    JSON.stringify(perProduct, null, 2),
    'utf8',
  );

  await fs.writeFile(
    path.join(outDir, 'analysis-coverage.json'),
    JSON.stringify(
      {
        totalProducts: products.length,
        withSeries: withSeries.length,
        withoutSeries: withoutSeries.length,
        coverage,
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log('✅ Analyse fertig');
  console.log('Total products:', products.length);
  console.log('With series:', withSeries.length);
  console.log('Without series:', withoutSeries.length);

  console.log('\nTop metafield keys:');
  for (const row of allKeys.slice(0, 20)) {
    console.log(`- ${row.key} (${row.count}) [${row.type}]`);
  }

  console.log('\nImportant coverage:');
  for (const row of coverage) {
    console.log(`- ${row.key}: ${row.productsWithValue}`);
  }

  console.log('\nDateien:');
  console.log('→ app/graphql/product/analysis-all-keys.json');
  console.log('→ app/graphql/product/analysis-products-summary.json');
  console.log('→ app/graphql/product/analysis-coverage.json');
}

main().catch((err) => {
  console.error('❌ Analyse fehlgeschlagen:', err);
  process.exit(1);
});
