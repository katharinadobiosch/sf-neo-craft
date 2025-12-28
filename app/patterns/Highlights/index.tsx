// app/patterns/Highlights/index.tsx
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import './highlights.scss';

type Img = {url: string; width?: number; height?: number; altText?: string};

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

function isMediaImageRef(v: unknown): v is MediaImageRef {
  return (
    typeof v === 'object' &&
    v !== null &&
    (v as {__typename?: string}).__typename === 'MediaImage'
  );
}

type SlateText = {value?: string | null};
type SlateChild = {children?: SlateText[]};
type SlateRoot = {children?: SlateChild[]};

function safeOverlayText(overlayRaw: string): string {
  if (!overlayRaw) return '';

  try {
    const parsed = JSON.parse(overlayRaw) as SlateRoot;
    return (
      parsed.children
        ?.map((p) => p.children?.map((c) => c.value ?? '').join(' '))
        .join('\n')
        .trim() ?? ''
    );
  } catch {
    return overlayRaw.replace(/<[^>]+>/g, ' ').trim();
  }
}

type ProjectItem = {
  id: string;
  image: Img | null;
  overlay: string;
  title: string;
};

export async function loader({context}: LoaderFunctionArgs) {
  const data = await context.storefront.query(PROJECTS_QUERY, {
    variables: {first: 50},
  });

  const nodes = (data?.metaobjects?.nodes ?? []) as ProjectNode[];

  const items: ProjectItem[] = nodes.map((n) => {
    const get = (k: string) => n.fields.find((f) => f.key === k);

    const title = get('title')?.value ?? '';

    const overlayRaw = get('overlay')?.value ?? '';
    const overlay = safeOverlayText(String(overlayRaw ?? ''));

    const img = get('image');
    let image: Img | null = null;

    const r = img?.reference;
    if (isMediaImageRef(r) && r.image?.url) {
      image = {
        url: r.image.url,
        width: r.image.width,
        height: r.image.height,
        altText: r.image.altText ?? undefined,
      };
    } else {
      const refs = img?.references?.nodes ?? [];
      const node = refs.find((x) => isMediaImageRef(x) && !!x.image?.url);

      if (node && isMediaImageRef(node) && node.image?.url) {
        image = {
          url: node.image.url,
          width: node.image.width,
          height: node.image.height,
          altText: node.image.altText ?? undefined,
        };
      }
    }

    return {id: n.id, image, title, overlay};
  });

  // Wichtig: json() statt Response.json(), damit useLoaderData<typeof loader>() korrekt typisiert
  return json({items});
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
          reference {
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
          references(first: 20) {
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

export default function ProjectsPage() {
  const {items} = useLoaderData<typeof loader>();

  return (
    <div className="highlights">
      <ul className="highlights__grid">
        {items.map((it) => (
          <li key={it.id} className="highlights__item">
            <FigureCard
              image={it.image}
              overlay={it.overlay}
              title={it.title}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FigureCard({
  image,
  overlay,
  title,
}: {
  image: Img | null;
  overlay: string;
  title?: string;
}) {
  const imageData = {
    url: image?.url,
    altText: image?.altText ?? '',
    width: image?.width,
    height: image?.height,
  };

  if (!image) {
    return (
      <figure className="card">
        <figcaption>Kein Bild</figcaption>
      </figure>
    );
  }

  return (
    <figure className="card">
      <div className="card__media">
        <Image
          data={imageData}
          className="card__img"
          sizes="(min-width:1200px) 33vw, (min-width:768px) 47vw, 100vw"
          loading="lazy"
        />
        {overlay && (
          <figcaption className="card__overlay">
            <span className="card__overlayText">{overlay}</span>
          </figcaption>
        )}
      </div>

      <figcaption className="card__caption">
        {title?.trim() || overlay}
      </figcaption>
    </figure>
  );
}
