/* eslint-env node */
import 'dotenv/config';
import fs from 'node:fs/promises';

const SHOP_DOMAIN =
  process.env.SHOPIFY_STORE_DOMAIN ||
  process.env.PUBLIC_STORE_DOMAIN ||
  process.env.SHOP_DOMAIN;

const ADMIN_TOKEN =
  process.env.SHOPIFY_ADMIN_TOKEN || process.env.ADMIN_API_TOKEN;

const API_VERSION = process.env.ADMIN_API_VERSION || '2024-10';

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

// Query A: mit access{} (neuere Felder)
const QUERY_WITH_ACCESS = `
  query defs($cursor: String) {
    metafieldDefinitions(first: 100, ownerType: PRODUCT, after: $cursor) {
      edges {
        cursor
        node {
          namespace
          key
          name
          type { name }
          access { storefront }
        }
      }
      pageInfo { hasNextPage }
    }
  }
`;

// Query B: konservativ (ohne access{}), falls A Fehler liefert
const QUERY_MINIMAL = `
  query defs($cursor: String) {
    metafieldDefinitions(first: 100, ownerType: PRODUCT, after: $cursor) {
      edges {
        cursor
        node {
          namespace
          key
          name
          type { name }
        }
      }
      pageInfo { hasNextPage }
    }
  }
`;

async function gql(query, variables = {}) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': ADMIN_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({query, variables}),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
  const json = JSON.parse(text);
  return json;
}

async function fetchDefs() {
  let cursor = null;
  let defs = [];
  let query = QUERY_WITH_ACCESS;

  // 1. Versuch: mit access{}
  try {
    while (true) {
      const json = await gql(query, {cursor});
      await fs.writeFile('./__raw_page.json', JSON.stringify(json, null, 2));
      if (json.errors)
        throw new Error('GraphQL errors: ' + JSON.stringify(json.errors));

      const page = json.data?.metafieldDefinitions;
      if (!page) throw new Error('data.metafieldDefinitions ist null/undef.');

      defs.push(...(page.edges || []).map((e) => e.node));
      if (!page.pageInfo?.hasNextPage) break;
      cursor = page.edges.at(-1).cursor;
    }
  } catch (e) {
    console.warn('⚠️  Fallback ohne access{} wegen:', e.message);
    // 2. Versuch: minimal ohne access{}
    cursor = null;
    defs = [];
    query = QUERY_MINIMAL;
    while (true) {
      const json = await gql(query, {cursor});
      await fs.writeFile(
        './__raw_page_min.json',
        JSON.stringify(json, null, 2),
      );
      if (json.errors)
        throw new Error('GraphQL errors: ' + JSON.stringify(json.errors));
      const page = json.data?.metafieldDefinitions;
      if (!page) throw new Error('data.metafieldDefinitions ist null/undef.');
      defs.push(...(page.edges || []).map((e) => e.node));
      if (!page.pageInfo?.hasNextPage) break;
      cursor = page.edges.at(-1).cursor;
    }
  }
  return defs;
}

async function run() {
  const defs = await fetchDefs();

  // Debug-Buckets
  const byNs = defs.reduce(
    (m, d) => ((m[d.namespace] = (m[d.namespace] || 0) + 1), m),
    {},
  );
  console.log('Total definitions:', defs.length);
  console.log('Namespaces:', byNs);

  await fs.writeFile(
    './metafield-defs-ALL.json',
    JSON.stringify(defs, null, 2),
  );

  // nur custom
  const customDefs = defs.filter((d) => d.namespace === 'custom');
  console.log('Custom total:', customDefs.length);
  if (!customDefs.length) {
    console.log(
      'Hinweis: Keine custom-Definitionen gefunden. Prüfe Store/Token/OwnerType.',
    );
  }

  await fs.writeFile(
    './product-metafield-defs.json',
    JSON.stringify(customDefs, null, 2),
  );

  const identifiers = customDefs
    .map((d) => `        {namespace: "custom", key: "${d.key}"}`)
    .join(',\n');

  const fragment = `# Generated
fragment ProductCustomMetafields on Product {
  metafields(identifiers: [
${identifiers}
  ]) {
    namespace
    key
    type
    value
    reference {
      __typename
      ... on Metaobject { id type handle fields { key type value } }
      ... on MediaImage { image { url altText } }
      ... on Video { sources { url mimeType } }
      ... on Model3d { sources { url mimeType } }
      ... on GenericFile { url mimeType }
    }
  }
}
`;
  await fs.writeFile('./product-metafields.fragment.graphql', fragment);

  console.log('✅ metafield-defs-ALL.json');
  console.log('✅ product-metafield-defs.json');
  console.log('✅ product-metafields.fragment.graphql');
}

run().catch((e) => {
  console.error('Fehler:', e);
  process.exit(1);
});
