import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import './highlights.scss';

type Img = {url: string; width?: number; height?: number; altText?: string};

// loader
export async function loader({context}: LoaderFunctionArgs) {
  const data = await context.storefront.query(PROJECTS_QUERY, {
    variables: {first: 50},
  });

  const items =
    data?.metaobjects?.nodes?.map((n: any) => {
      const get = (k: string) => n.fields.find((f: any) => f.key === k);

      const title = get('title')?.value ?? '';

      // Overlay mit JSON-Fallback
      const overlayRaw = get('overlay')?.value ?? '';
      let overlay = '';
      try {
        const parsed = JSON.parse(overlayRaw);
        overlay = parsed?.children
          ?.map((p: any) =>
            p.children?.map((c: any) => c.value ?? '').join(' '),
          )
          .join('\n')
          ?.trim();
      } catch {
        overlay =
          typeof overlayRaw === 'string'
            ? overlayRaw.replace(/<[^>]+>/g, ' ').trim()
            : '';
      }

      // image
      const img = get('image');
      let image: Img | null = null;
      const r = img?.reference;
      if (r?.__typename === 'MediaImage' && r.image?.url) {
        image = {
          url: r.image.url,
          width: r.image.width,
          height: r.image.height,
          altText: r.image.altText,
        };
      } else if (img?.references?.nodes?.length) {
        const node = img.references.nodes.find(
          (x: any) => x.__typename === 'MediaImage' && x.image?.url,
        );
        if (node)
          image = {
            url: node.image.url,
            width: node.image.width,
            height: node.image.height,
            altText: node.image.altText,
          };
      }

      return {
        id: n.id,
        image,
        title,
        overlay,
      };
    }) ?? [];

  return Response.json({items});
}

// Query bleibt gleich – du holst ja bereits key/value/refs aller Felder

const PROJECTS_QUERY = `#graphql
  query Projects($first: Int!) {
    metaobjects(type: "projects", first: $first) {
      nodes { id updatedAt fields {
        key value reference { __typename ... on MediaImage { image { url width height altText } } }
        references(first: 20) { nodes { __typename ... on MediaImage { image { url width height altText } } } }
      } }
    }
  }
`;

// Page
export default function ProjectsPage() {
  const {items} = useLoaderData<typeof loader>();
  return (
    <main className="highlights">
      <ul className="highlights__grid">
        {items.map((it: any) => (
          <li key={it.id} className="highlights__item">
            <FigureCard
              image={it.image}
              overlay={it.overlay}
              title={it.title}
            />
          </li>
        ))}
      </ul>
    </main>
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
  // if (!image) return null;

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
          style={{aspectRatio: '778/519'}}
        />
        {overlay && (
          <figcaption className="card__overlay">
            <span className="card__overlayText">{overlay}</span>
          </figcaption>
        )}
      </div>

      {/* Titel ausgeben; Overlay als Fallback, falls kein Titel gepflegt */}
      <figcaption className="card__caption">
        {title?.trim() || overlay}
      </figcaption>
    </figure>
  );
}
