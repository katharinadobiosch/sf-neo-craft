import {useState} from 'react';
import {useLoaderData, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, request}) {
  const {collection} = await context.storefront.query(
    COLLECTION_BY_HANDLE_QUERY,
    {
      variables: {
        handle: 'materials', // oder dein eigener Handle
      },
    },
  );

  return {collection};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

function getTileImages(product: any) {
  const refs =
    product.metafield?.references?.nodes
      ?.map((n: any) => n?.image)
      .filter(Boolean) ?? [];
  return {
    main: refs[0] || product.featuredImage || null,
    hover: refs[1] || null,
  };
  console.log('PRODUCT', product.title);
  console.log(
    'neoColorProduct raw',
    product.neoColorProduct?.references?.nodes,
  );
}

function mapColorNodes(nodes: any[]) {
  return (nodes ?? [])
    .map((n: any) => ({
      hex: n?.hex?.value ?? null,
      label: n?.label?.value ?? '',
    }))
    .filter((c) => !!c.hex);
}

function dedupeByHex(colors: {hex: string; label: string}[]) {
  const seen = new Set<string>();
  return colors.filter((c) => !seen.has(c.hex) && (seen.add(c.hex), true));
}

function getProductColors(product: any) {
  // 1) Produkt-Ebene
  const productNodes = product?.neoColorProduct?.references?.nodes ?? [];
  const productColors = mapColorNodes(productNodes);

  if (productColors.length === 0) {
    console.warn(`no color selected (product): ${product?.title ?? 'unknown'}`);
  } else {
    return productColors;
  }

  // 2) Fallback: Varianten-Ebene
  const variantNodes = (product?.variants?.nodes ?? []).flatMap(
    (v: any) => v?.neoColorVariants?.references?.nodes ?? [],
  );
  const variantColors = dedupeByHex(mapColorNodes(variantNodes));

  if (variantColors.length === 0) {
    console.warn(
      `no color selected (variants either): ${product?.title ?? 'unknown'}`,
    );
  }

  return variantColors; // evtl. leer – dann werden keine Swatches gerendert
}

function ProductItem({product, isReversed}) {
  const {main, hover} = getTileImages(product);
  const [isHover, setIsHover] = useState(false);
  const showHover = Boolean(hover && isHover);

  const colors = getProductColors(product);

  console.log('PRODUCT', product);

  console.log('PRODUCT', product.title);
  console.log(
    'neoColorProduct raw',
    product.neoColorProduct?.references?.nodes,
  );
  console.log('colors mapped', colors);

  return (
    <Link
      to={`/products/${product.handle}`}
      className={`material-card ${isReversed ? 'material-card--reverse' : ''}`}
      prefetch="intent"
    >
      <div
        className="product-media"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onFocus={() => setIsHover(true)}
        onBlur={() => setIsHover(false)}
        style={{position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden'}}
      >
        {main && (
          <Image
            data={main}
            alt={main.altText || product.title}
            className="material-card__image"
            sizes="(min-width: 60rem) 40rem, 100vw"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%', // ⬅️ füllt die Fläche sicher
              height: '100%',
              objectFit: 'cover',
              opacity: showHover ? 0 : 1,
              transition: 'opacity .25s ease',
            }}
          />
        )}
        {hover && (
          <Image
            data={hover}
            alt={hover.altText || product.title}
            className="material-card__image"
            sizes="(min-width: 60rem) 40rem, 100vw"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: showHover ? 1 : 0,
              transition: 'opacity .25s ease',
            }}
            loading="lazy"
          />
        )}
      </div>

      <div className="material-card__content">
        <h3 id={`title-${product.id}`} className="material-card__title">
          {product.title}
        </h3>

        <p className="material-card__description">
          Ein Material voller Magie: Dichroisches Glas verändert je nach
          Blickwinkel und Lichteinfall seine Farbe – schillernd, lebendig, immer
          im Wandel.
        </p>

        {/* ⬇️ Swatches aus Metaobjekten */}
        {colors?.length > 0 && (
          <ul className="material-card__swatches" aria-label="Farbvarianten">
            {colors.map((c: any, i: number) => (
              <li key={`${c.hex}-${i}`}>
                <span
                  className="material-card__swatch"
                  style={{background: c.hex}}
                  title={c.label}
                  aria-label={c.label}
                  role="img"
                />
              </li>
            ))}
          </ul>
        )}

        {/* schwarze CTA-Bar, bleibt innerhalb des großen Links */}
        <span className="material-card__ctaBar" aria-hidden="true">
          <span className="material-card__ctaIcon" aria-hidden="true">
            →
          </span>
          Order your Sample
        </span>
      </div>
    </Link>
  );
}

export default function Materials() {
  const {collection} = useLoaderData();

  return (
    <>
      ´
      <div className="materials">
        <div className="materials-grid">
          {collection.products?.nodes?.map((product, i) => (
            <ProductItem
              key={product.id}
              product={product}
              isReversed={i % 2 === 1} // jede zweite Karte spiegeln
            />
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * @param {{
 *   collection: CollectionFragment;
 *   index: number;
 * }}
 */

const COLLECTION_BY_HANDLE_QUERY = `#graphql
#graphql
query CollectionByHandle_Materials(
  $handle: String!
  $country: CountryCode
  $language: LanguageCode
) @inContext(country: $country, language: $language) {
  collection(handle: $handle) {
    id
    title
    handle
    image { id url altText width height }
    products(first: 20) {
      nodes {
        id
        title
        handle
        featuredImage { url altText width height }

        # Bilder für die Kachel (unverändert)
        metafield(namespace: "custom", key: "product_tile") {
          type
          references(first: 2) {
            nodes {
              ... on MediaImage {
                image { url altText width height }
              }
            }
          }
        }

        # ✅ Produkt-Ebene: Liste von Neo-Color Metaobjekten
        neoColorProduct: metafield(namespace: "custom", key: "neo_color_product") {
          type
          references(first: 50) {
            nodes {
              ... on Metaobject {
                id
                hex:   field(key: "hex_code") { value }
                label: field(key: "label")    { value }
                image: field(key: "image")    { value }
              }
            }
          }
        }

        # 🛟 Fallback: Varianten-Ebene (Definition heißt bei dir custom.color)
        variants(first: 50) {
          nodes {
            id
            neoColorVariants: metafield(namespace: "custom", key: "color") {
              type
              references(first: 50) {
                nodes {
                  ... on Metaobject {
                    id
                    hex:   field(key: "hex_code") { value }
                    label: field(key: "label")    { value }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('storefrontapi.generated').CollectionFragment} CollectionFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
