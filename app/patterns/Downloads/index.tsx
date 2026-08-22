import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {json} from '@remix-run/server-runtime';
import {useLoaderData} from 'react-router';
import './downloads.scss';

type MetaField = {
  key: string;
  value?: string | null;
};

type DownloadNode = {
  id: string;
  fields: MetaField[];
};

type DownloadItem = {
  id: string;
  title: string;
  url: string;
  position: number;
};

export async function loader({context}: LoaderFunctionArgs) {
  const data = await context.storefront.query(DOWNLOADS_QUERY, {
    variables: {
      first: 50,
    },
  });

  const nodes = (data?.metaobjects?.nodes ?? []) as DownloadNode[];

  const items: DownloadItem[] = nodes
    .map((node) => {
      const getField = (key: string) =>
        node.fields.find((field) => field.key === key);

      return {
        id: node.id,
        title: getField('titel')?.value?.trim() ?? '',
        url: getField('url')?.value?.trim() ?? '',
        position: Number(getField('position')?.value ?? 0),
      };
    })
    .filter((item) => item.title && item.url)
    .sort((a, b) => a.position - b.position);
  return json<{items: DownloadItem[]}>({
    items,
  });
}

const DOWNLOADS_QUERY = `#graphql
  query Downloads($first: Int!) {
    metaobjects(type: "downloads", first: $first) {
      nodes {
        id
        fields {
          key
          value
        }
      }
    }
  }
`;

export default function Downloads() {
  const {items = []} = useLoaderData() as {
    items: DownloadItem[];
  };

  return (
    <section className="downloads" aria-label="Downloads">
      <div className="downloads__list">
        {items.map((item) => (
          <a
            key={item.id}
            className="downloads__row"
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.title}
          </a>
        ))}
      </div>
    </section>
  );
}
