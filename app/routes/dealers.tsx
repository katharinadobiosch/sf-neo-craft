// app/routes/dealers.tsx
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from 'react-router';
import Dealers, {type Dealer} from '~/patterns/Dealers';

export async function loader({context}: LoaderFunctionArgs) {
  const data = await context.storefront.query(DEALERS_QUERY, {
    variables: {first: 200},
  });

  const items: Dealer[] =
    data?.metaobjects?.nodes?.map((n: any) => {
      const get = (k: string) =>
        n.fields.find((f: any) => f.key === k)?.value ?? '';
      return {
        id: n.id,
        country: get('country'),
        name: get('name'),
        city: get('city'),
        website: get('website'),
      };
    }) ?? [];

  // leicht sortieren (Land -> Name)
  items.sort(
    (a, b) =>
      a.country.localeCompare(b.country) || a.name.localeCompare(b.name),
  );

  return Response.json({items});
}

const DEALERS_QUERY = `#graphql
  query Dealers($first: Int!) {
    metaobjects(type: "dealers", first: $first) {
      nodes {
        id
        fields { key value }
      }
    }
  }
`;

export default function DealersRoute() {
  const {items} = useLoaderData<typeof loader>();
  return <Dealers items={items} />;
}
