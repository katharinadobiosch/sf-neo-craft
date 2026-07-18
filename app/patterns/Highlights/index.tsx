import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {json} from '@remix-run/server-runtime';
import {useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import './highlights.scss';

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

type ProjectNode = {
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

function isMediaImageRef(value: unknown): value is MediaImageRef {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as {__typename?: string}).__typename === 'MediaImage'
  );
}

type ProjectItem = {
  id: string;
  images: Img[];
  portrait: boolean;
  title: string;
};

export async function loader({context}: LoaderFunctionArgs) {
  const data = await context.storefront.query(PROJECTS_QUERY, {
    variables: {first: 50},
  });

  const nodes = (data?.metaobjects?.nodes ?? []) as ProjectNode[];

  const items: ProjectItem[] = nodes.map((node) => {
    const getField = (key: string) =>
      node.fields.find((field) => field.key === key);

    const title = getField('title')?.value?.trim() ?? '';
    const portrait = getField('portrait')?.value === 'true';

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
    };
  });
  const portraitIndex = items.findIndex((item) => item.portrait);

  if (portraitIndex > 1) {
    const [portraitItem] = items.splice(portraitIndex, 1);
    items.splice(1, 0, portraitItem);
  }

  console.table(
    items.map((item, index) => ({
      index,
      title: item.title,
      portrait: item.portrait,
    })),
  );

  return json<{items: ProjectItem[]}>({items});
}

const PROJECTS_QUERY = `#graphql
  query Projects($first: Int!) {
    metaobjects(type: "projects", first: $first) {
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
  items: ProjectItem[];
};

export default function ProjectsPage() {
  const {items = []} = useLoaderData() as LoaderData;

  return (
    <div className="collections highlights">
      <div className="collections-grid">
        {items.map((item) => (
          <div
            key={item.id}
            className={`product-item ${
              item.portrait
                ? 'product-item--portrait'
                : 'product-item--landscape'
            }`}
          >
            <FigureCard images={item.images} title={item.title} />
          </div>
        ))}
      </div>
    </div>
  );
}

function FigureCard({images, title}: {images: Img[]; title: string}) {
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

      <div className="product-caption">
        <h4 className="product-title">{title}</h4>
      </div>
    </figure>
  );
}
