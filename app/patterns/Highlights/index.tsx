import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';

type Img = {url: string; width?: number; height?: number; altText?: string};

export async function loader({context}: LoaderFunctionArgs) {
  try {
    const data = await context.storefront.query(PROJECTS_QUERY, {
      variables: {first: 50},
    });

    const items =
      data?.metaobjects?.nodes?.map((n: any) => {
        const get = (k: string) => n.fields.find((f: any) => f.key === k);

        // Text-Felder: caption = RichText (HTML-String), text = Einzeiler
        const textSingle: string = get('text')?.value ?? '';
        const captionRich: string = get('caption')?.value ?? '';
        const overlay =
          textSingle ||
          (typeof captionRich === 'string'
            ? captionRich.replace(/<[^>]+>/g, ' ').trim()
            : '');

        // Bild: reference (Einzel) oder references (Liste)
        const imgField = get('image');
        let image: Img | null = null;

        const ref = imgField?.reference;
        if (ref?.__typename === 'MediaImage' && ref.image?.url) {
          image = {
            url: ref.image.url,
            width: ref.image.width,
            height: ref.image.height,
            altText: ref.image.altText,
          };
        }
        if (!image && imgField?.references?.nodes?.length) {
          const node = imgField.references.nodes.find(
            (r: any) => r.__typename === 'MediaImage' && r.image?.url,
          );
          if (node) {
            image = {
              url: node.image.url,
              width: node.image.width,
              height: node.image.height,
              altText: node.image.altText,
            };
          }
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

    // Sortierung: position ASC, dann updatedAt DESC
    items.sort((a: any, b: any) => {
      const p = (a.position ?? 0) - (b.position ?? 0);
      if (p !== 0) return p;
      return (
        (b.updatedAt ? Date.parse(b.updatedAt) : 0) -
        (a.updatedAt ? Date.parse(a.updatedAt) : 0)
      );
    });

    return Response.json({items});
  } catch (e) {
    console.error('[projects loader]', e);
    return Response.json({items: []});
  }
}

const PROJECTS_QUERY = `#graphql
  query Projects($first: Int!) {
    # Dein Typ heißt "projects" (plural)
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
              image { url width height altText }
            }
          }
          references(first: 20) {
            nodes {
              __typename
              ... on MediaImage {
                image { url width height altText }
              }
            }
          }
        }
      }
    }
  }
`;

export default function HighlightsPage() {
  const {items} = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-12">
      <h1 className="mb-10 text-3xl font-medium tracking-tight">Highlights</h1>

      {!items?.length && (
        <p className="mb-8 text-sm opacity-70">
          Keine Einträge gefunden. Prüfe im Admin bei{' '}
          <b>Inhalt → Metaobjekte → projects</b>: API-Zugriff aktiv, Einträge
          vorhanden und Felder <code>image</code>, <code>caption</code>,{' '}
          <code>text</code> befüllt.
        </p>
      )}

      {/* Grid wie im Layout: 1/2/3 Spalten mit großzügigen Abständen */}
      <ul className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it: any) => (
          <li key={it.id}>
            <FigureCard image={it.image} overlay={it.overlay} />
          </li>
        ))}
      </ul>
    </main>
  );
}

function FigureCard({image, overlay}: {image: Img | null; overlay: string}) {
  if (!image) return null;

  // Datenobjekt für <Image>
  const imageData = {
    url: image.url,
    altText: image.altText ?? '',
    width: image.width,
    height: image.height,
  };

  return (
    <figure className="group relative overflow-hidden rounded-sm bg-neutral-100">
      {/* Bild im 4:3-Frame mit sanftem Zoom auf Hover */}
      <div className="relative w-full">
        <div className="aspect-[4/3]">
          <Image
            data={imageData}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            aspectRatio="4/3"
            // Responsive Bildgrößen: Desktop ~33vw, Tablet ~50vw, Mobile 100vw
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            loading="lazy"
          />
        </div>

        {/* Hover-Overlay mit Text */}
        <figcaption className="pointer-events-none absolute inset-0 flex items-end bg-black/0 p-4 text-white transition-colors duration-300 group-hover:bg-black/40">
          <span className="translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {overlay}
          </span>
        </figcaption>
      </div>

      {/* Zeile unter dem Bild – kleiner Untertitel (dein Einzeiler/Text) */}
      <figcaption className="mt-2 block text-sm tracking-tight text-neutral-800">
        {overlay}
      </figcaption>
    </figure>
  );
}
