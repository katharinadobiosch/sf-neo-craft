/* eslint-env node */
import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';

const SHOP_DOMAIN =
  process.env.SHOPIFY_STORE_DOMAIN ||
  process.env.PUBLIC_STORE_DOMAIN ||
  process.env.SHOP_DOMAIN;

const ADMIN_TOKEN =
  process.env.SHOPIFY_ADMIN_TOKEN || process.env.ADMIN_API_TOKEN;

const API_VERSION = process.env.ADMIN_API_VERSION || '2025-01';

if (!SHOP_DOMAIN || !ADMIN_TOKEN) {
  console.error('Fehlt SHOP_DOMAIN oder ADMIN_TOKEN.', {
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    PUBLIC_STORE_DOMAIN: process.env.PUBLIC_STORE_DOMAIN,
    SHOP_DOMAIN: process.env.SHOP_DOMAIN,
    SHOPIFY_ADMIN_TOKEN: !!process.env.SHOPIFY_ADMIN_TOKEN,
    ADMIN_API_TOKEN: !!process.env.ADMIN_API_TOKEN,
  });
  process.exit(1);
}

const endpoint = `https://${SHOP_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;

const QUERY = `
  query productsPage($cursor: String) {
    products(first: 20, after: $cursor) {
      edges {
        cursor
        node {
          id
          title
          handle
          productType
          vendor
          status
          tags

          options {
            id
            name
            optionValues {
              id
              name
            }
          }

          variants(first: 20) {
            nodes {
              id
              title
              sku
              availableForSale
              selectedOptions {
                name
                value
              }
              price
            }
          }

          metafields(first: 40) {
            nodes {
              namespace
              key
              type
              value
            }
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

async function gqlFetch(query, variables) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ADMIN_TOKEN,
    },
    body: JSON.stringify({query, variables}),
  });

  const json = await res.json();

  if (json.errors) {
    const msg = json.errors.map((e) => e.message).join('; ');
    throw new Error(msg || 'GraphQL error');
  }

  return json.data;
}

async function fetchAllProducts() {
  let cursor = null;
  const all = [];

  for (;;) {
    const data = await gqlFetch(QUERY, {cursor});
    const page = data.products;

    for (const edge of page.edges) {
      all.push(edge.node);
    }

    if (!page.pageInfo.hasNextPage) break;
    cursor = page.edges.at(-1).cursor;
  }

  return all;
}

function simplifyProduct(product) {
  const metafields = {};
  for (const mf of product.metafields?.nodes || []) {
    metafields[`${mf.namespace}.${mf.key}`] = {
      type: mf.type,
      value: mf.value,
    };
  }

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    productType: product.productType,
    vendor: product.vendor,
    status: product.status,
    tags: product.tags,
    options: product.options || [],
    variants: (product.variants?.nodes || []).map((variant) => ({
      id: variant.id,
      title: variant.title,
      sku: variant.sku,
      availableForSale: variant.availableForSale,
      price: variant.price,
      selectedOptions: variant.selectedOptions || [],
    })),
    metafields,
  };
}

async function main() {
  const OUT_DIR = path.resolve('app/graphql/product');
  const OUT_FILE = path.join(OUT_DIR, 'products-with-metafields.json');

  await fs.mkdir(OUT_DIR, {recursive: true});

  const products = await fetchAllProducts();
  const simplified = products.map(simplifyProduct);

  await fs.writeFile(OUT_FILE, JSON.stringify(simplified, null, 2), 'utf8');

  console.log('✅ Produkt-Export fertig');
  console.log('  →', path.relative(process.cwd(), OUT_FILE));
  console.log('  Produkte:', simplified.length);
}

main().catch((e) => {
  console.error('❌ Fehler:', e?.message || e);
  process.exit(1);
});
