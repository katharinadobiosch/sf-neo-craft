// app/patterns/Materials/index.tsx
import {useState} from 'react';
import {useLoaderData, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

type ColorItem = {hex: string; label: string};

type ProductLike = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: unknown | null;
  metafield?: {
    references?: {nodes?: Array<{image?: unknown | null} | null> | null} | null;
  } | null;
  materialTileColors?: {references?: {nodes?: unknown[] | null} | null} | null;
  variants?: {
    nodes?: Array<{
      neoColorVariants?: {
        references?: {nodes?: unknown[] | null} | null;
      } | null;
    } | null> | null;
  } | null;
};

export async function loader(args: LoaderFunctionArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({
  context,
}: Pick<LoaderFunctionArgs, 'context'>) {
  const {collection} = await context.storefront.query(
    COLLECTION_BY_HANDLE_QUERY,
    {
      variables: {handle: 'materials'},
    },
  );

  return {collection};
}

function loadDeferredData(_args: Pick<LoaderFunctionArgs, 'context'>) {
  return {};
}

function getTileImages(product: ProductLike) {
  const refs =
    product.metafield?.references?.nodes
      ?.map((n) => n?.image ?? null)
      .filter(Boolean) ?? [];
  return {
    main: refs[0] || product.featuredImage || null,
    hover: refs[1] || null,
  };
}

function mapColorNodes(nodes: unknown[]) {
  return (nodes ?? [])
    .map((n) => {
      const obj = n as any;
      return {
        hex: obj?.hex?.value ?? null,
        label: obj?.label?.value ?? '',
      };
    })
    .filter((c): c is {hex: string; label: string} => !!c.hex);
}

function dedupeByHex(colors: ColorItem[]) {
  const seen = new Set<string>();
  return colors.filter((c) => !seen.has(c.hex) && (seen.add(c.hex), true));
}

function getProductColors(product: ProductLike) {
  const productNodes = (product?.materialTileColors?.references?.nodes ??
    []) as unknown[];
  const productColors = mapColorNodes(productNodes);

  if (productColors.length > 0) return productColors;

  const variantNodes =
    (product?.variants?.nodes ?? []).flatMap((v) => {
      const nodes = (v as any)?.neoColorVariants?.references?.nodes;
      return Array.isArray(nodes) ? (nodes as unknown[]) : [];
    }) ?? [];

  return dedupeByHex(mapColorNodes(variantNodes));
}

function ProductItem({
  product,
  isReversed,
}: {
  product: ProductLike;
  isReversed: boolean;
}) {
  const {main, hover} = getTileImages(product);
  const [isHover, setIsHover] = useState(false);
  const showHover = Boolean(hover && isHover);

  const colors = getProductColors(product);

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
        style={{position: 'relative', overflow: 'hidden'}}
      >
        {main && (
          <Image
            data={main as any}
            alt={(main as any)?.altText || product.title}
            className="material-card__image"
            sizes="(min-width: 60rem) 40rem, 100vw"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: showHover ? 0 : 1,
              transition: 'opacity .25s ease',
            }}
          />
        )}
        {hover && (
          <Image
            data={hover as any}
            alt={(hover as any)?.altText || product.title}
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

        {colors?.length > 0 && (
          <ul className="material-card__swatches" aria-label="Farbvarianten">
            {colors.map((c, i) => (
              <li key={`${c.hex}-${i}`}>
                <span
                  className="material-card__swatch"
                  style={{backgroundColor: c.hex}}
                  title={c.label}
                  aria-label={c.label}
                  role="img"
                  tabIndex={0}
                />
              </li>
            ))}
          </ul>
        )}

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
  const {collection} = useLoaderData<typeof loader>();

  return (
    <div className="materials">
      <div className="materials-grid">
        {(collection?.products?.nodes ?? []).map(
          (product: ProductLike, i: number) => (
            <ProductItem
              key={product.id}
              product={product}
              isReversed={i % 2 === 1}
            />
          ),
        )}
      </div>
    </div>
  );
}

const COLLECTION_BY_HANDLE_QUERY = `#graphql
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

        materialTileColors: metafield(namespace: "custom", key: "material_tile_color") {
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
