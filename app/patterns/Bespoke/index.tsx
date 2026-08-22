import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {json} from '@remix-run/server-runtime';
import {useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import './bespoke.scss';

type Img = {
  url: string;
  width?: number;
  height?: number;
  altText?: string;
};

type MetaField = {
  key: string;
  value?: string | null;
  reference?: unknown;
  references?: {nodes?: unknown[]} | null;
};

type BespokeNode = {
  id: string;
  fields: MetaField[];
};

type MediaImageRef = {
  __typename: 'MediaImage';
  image?: {
    url?: string;
    width?: number;
    height?: number;
    altText?: string | null;
  } | null;
};

type BespokeItem = {
  id: string;
  images: Img[];
  portrait: boolean;
  title: string;
  year: string;
  products: string;
  position: number;
};

function isMediaImageRef(value: unknown): value is MediaImageRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as {__typename?: string}).__typename === 'MediaImage'
  );
}

export async function loader({context}: LoaderFunctionArgs) {
  const data = await context.storefront.query(BESPOKE_QUERY, {
    variables: {first: 50},
  });

  const nodes = (data?.metaobjects?.nodes ?? []) as BespokeNode[];

  const items: BespokeItem[] = nodes
    .map((node) => {
      const getField = (key: string) =>
        node.fields.find((field) => field.key === key);

      const title = getField('title')?.value?.trim() ?? '';
      const year = getField('year')?.value?.trim() ?? '';
      const products = getField('products')?.value?.trim() ?? '';
      const portrait = getField('portrait')?.value === 'true';

      const rawPosition = getField('position')?.value;
      const position = rawPosition
        ? Number(rawPosition)
        : Number.MAX_SAFE_INTEGER;

      const imageField = getField('image');
      const imageReferences = imageField?.references?.nodes ?? [];

      const images = imageReferences
        .filter(isMediaImageRef)
        .filter(
          (
            reference,
          ): reference is MediaImageRef & {
            image: NonNullable<MediaImageRef['image']> & {url: string};
          } => Boolean(reference.image?.url),
        )
        .map((reference) => ({
          url: reference.image.url,
          width: reference.image.width,
          height: reference.image.height,
          altText: reference.image.altText ?? undefined,
        }));

      return {
        id: node.id,
        images,
        portrait,
        title,
        year,
        products,
        position,
      };
    })
    .sort((a, b) => a.position - b.position);

  return json<{items: BespokeItem[]}>({items});
}

const BESPOKE_QUERY = `#graphql
  query Bespoke($first: Int!) {
    metaobjects(type: "bespoke", first: $first) {
      nodes {
        id
        updatedAt
        fields {
          key
          value
          references(first: 2) {
            nodes {
              __typename
              ... on MediaImage {
                image {
                  url
                  width
                  height
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

type LoaderData = {
  items: BespokeItem[];
};

export default function BespokePage() {
  const {items = []} = useLoaderData() as LoaderData;

  const columnHeights = [0, 0];

  const positionedItems = items.map((item) => {
    const column = columnHeights[0] <= columnHeights[1] ? 1 : 2;
    const occupiedRows = item.portrait ? 2 : 1;

    columnHeights[column - 1] += occupiedRows;

    return {
      ...item,
      column,
    };
  });

  return (
    <div className="collections bespoke">
      <div className="collections-grid">
        {positionedItems.map((item) => (
          <div
            key={item.id}
            className={[
              'product-item',
              item.portrait
                ? 'product-item--portrait'
                : 'product-item--landscape',
              item.column === 2 ? 'product-item--right' : 'product-item--left',
            ].join(' ')}
          >
            <FigureCard
              images={item.images}
              title={item.title}
              year={item.year}
              products={item.products}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function FigureCard({
  images,
  title,
  year,
  products,
}: {
  images: Img[];
  title: string;
  year: string;
  products: string;
}) {
  const primaryImage = images[0];
  const hoverImage = images[1];

  return (
    <figure className="card">
      <div className="product-media card__media">
        {primaryImage && (
          <Image
            data={{
              url: primaryImage.url,
              altText: primaryImage.altText ?? title,
              width: primaryImage.width,
              height: primaryImage.height,
            }}
            className="card__img card__img--primary"
            sizes="(min-width:1200px) 50vw, (min-width:768px) 50vw, 100vw"
            loading="lazy"
          />
        )}

        {hoverImage && (
          <Image
            data={{
              url: hoverImage.url,
              altText: hoverImage.altText ?? title,
              width: hoverImage.width,
              height: hoverImage.height,
            }}
            className="card__img card__img--secondary"
            sizes="(min-width:1200px) 50vw, (min-width:768px) 50vw, 100vw"
            loading="lazy"
          />
        )}
      </div>

      <figcaption className="product-caption">
        {title && <div className="product-title">Projekt: {title}</div>}

        {year && <div className="project-meta">Jahr: {year}</div>}

        {products && <div className="project-meta">Produkte: {products}</div>}
      </figcaption>
    </figure>
  );
}
