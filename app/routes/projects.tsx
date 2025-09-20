// app/routes/projects.tsx
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from 'react-router';

export async function loader({context}: LoaderFunctionArgs) {
  try {
    const data = await context.storefront.query(PROJECTS_QUERY, {
      variables: {first: 100},
    });

    const items =
      data?.metaobjects?.nodes?.map((n: any) => {
        const get = (k: string) => n.fields.find((f: any) => f.key === k);
        const img = get('image')?.reference?.image;
        return {
          id: n.id,
          updatedAt: n.updatedAt ?? null,
          caption: get('caption')?.value ?? '',
          position: Number(get('position')?.value ?? 0),
          image: img
            ? {
                url: img.url,
                alt: img.altText ?? '',
                w: img.width,
                h: img.height,
              }
            : null,
        };
      }) ?? [];

    // Sortierung: zuerst position (aufsteigend), dann updatedAt (neueste zuerst)
    items.sort((a: any, b: any) => {
      const pos = (a.position ?? 0) - (b.position ?? 0);
      if (pos !== 0) return pos;
      const da = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const db = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return db - da;
    });

    return Response.json({items});
  } catch (e) {
    console.error('[projects loader]', e);
    // keine 500-Seite auswerfen – lieber leer rendern
    return Response.json({items: []});
  }
}

const PROJECTS_QUERY = `#graphql
  query Projects($first: Int!) {
    metaobjects(
      type: "project"
      first: $first
    ) {
      nodes {
        id
        updatedAt
        fields {
          key
          value
          reference {
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
`;

export default function ProjectsPage() {
  const {items} = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-medium">Projects</h1>

      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it: any) => (
          <li key={it.id}>
            <FigureCard image={it.image} caption={it.caption} />
          </li>
        ))}
      </ul>
    </main>
  );
}

function FigureCard({
  image,
  caption,
}: {
  image: {url: string; alt?: string; w: number; h: number} | null;
  caption: string;
}) {
  if (!image) return null;

  return (
    <figure className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
      <img
        src={image.url}
        alt={image.alt ?? ''}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <figcaption className="pointer-events-none absolute inset-0 flex items-end bg-black/0 p-4 text-white transition group-hover:bg-black/40">
        <span className="translate-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
          {caption}
        </span>
      </figcaption>
      <button className="absolute inset-0" aria-label={caption || 'Bild'} />
    </figure>
  );
}
