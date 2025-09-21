import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';
import './materials.scss';

type Img = {url: string; width?: number; height?: number; altText?: string};

export async function loader({context}: LoaderFunctionArgs) {
  const data = await context.storefront.query(PROJECTS_QUERY, {
    variables: {first: 50},
  });
  const items =
    data?.metaobjects?.nodes?.map((n: any) => {
      const get = (k: string) => n.fields.find((f: any) => f.key === k);
      const textSingle: string = get('text')?.value ?? '';
      const captionRich: string = get('caption')?.value ?? '';
      const overlay =
        textSingle ||
        (typeof captionRich === 'string'
          ? captionRich.replace(/<[^>]+>/g, ' ').trim()
          : '');

      // image (reference/references)
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

      const pos = Number(get('position')?.value ?? 0);
      return {
        id: n.id,
        updatedAt: n.updatedAt ?? null,
        position: Number.isFinite(pos) ? pos : 0,
        image,
        overlay,
      };
    }) ?? [];

  items.sort(
    (a: any, b: any) =>
      (a.position ?? 0) - (b.position ?? 0) ||
      (b.updatedAt ? +new Date(b.updatedAt) : 0) -
        (a.updatedAt ? +new Date(a.updatedAt) : 0),
  );
  return Response.json({items});
}

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

export default function ProjectsPage() {
  const {items} = useLoaderData<typeof loader>();
  return (
    <main className="materials">
      <ul className="materials__grid">
        {items.map((it: any) => (
          <li key={it.id} className="materials__item">
            <FigureCard image={it.image} overlay={it.overlay} />
          </li>
        ))}
      </ul>
    </main>
  );
}

function FigureCard({image, overlay}: {image: Img | null; overlay: string}) {
  if (!image) return null;

  const imageData = {
    url: image.url,
    altText: image.altText ?? '',
    width: image.width,
    height: image.height,
  };

  return (
    <figure className="card">
      <div className="card__media">
        <Image
          data={imageData}
          className="card__img"
          sizes="(min-width:1200px) 33vw, (min-width:768px) 47vw, 100vw"
          loading="lazy"
        />
        <figcaption className="card__overlay">
          <span className="card__overlayText">{overlay}</span>
        </figcaption>
      </div>
      <figcaption className="card__caption">{overlay}</figcaption>
    </figure>
  );
}
