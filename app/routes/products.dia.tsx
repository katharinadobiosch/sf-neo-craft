import * as React from 'react';

import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {json} from '@remix-run/server-runtime'; // <= HIERHER!

import {useLoaderData} from '@remix-run/react'; // <= Remix-Hook
import {Money, Image} from '@shopify/hydrogen';

type Rod = 'mirror' | 'brass';

// 👉 Handles deiner zwei echten Produkte in Shopify.
// Du findest die Handles im Shopify-Admin auf der Produktseite unter "Suchmaschinenvorschau" (URL-Handle).
const MIRROR_HANDLE = 'dia-with-mirror-steel-rod-kopie';
const BRASS_HANDLE = 'dia-with-brass-rod-kopie';

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;

  const data = await storefront.query(DIA_BY_HANDLES, {
    variables: {mirror: MIRROR_HANDLE, brass: BRASS_HANDLE},
  });

  if (!data?.mirror || !data?.brass) {
    throw new Response('DIA products not found', {status: 404});
  }

  return json({mirror: data.mirror, brass: data.brass});
}

export default function DiaParentPDP() {
  const {mirror, brass} = useLoaderData<typeof loader>();
  const [rod, setRod] = React.useState<Rod>('mirror');
  const active = rod === 'mirror' ? mirror : brass;

  const [variantId, setVariantId] = React.useState<string>(
    active.variants.nodes[0]?.id,
  );

  // Beim Rod-Wechsel versuche gleiche Options beizubehalten
  React.useEffect(() => {
    const prev = getSelectedOptionsFromVariantId(
      rod === 'mirror' ? brass : mirror,
      variantId,
    );
    const nextVariant =
      findVariantBySelectedOptions(active, prev) || active.variants.nodes[0];
    if (nextVariant) setVariantId(nextVariant.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rod]);

  const v = active.variants.nodes.find((x: any) => x.id === variantId);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 text-white">
      <h1 className="mb-4 text-3xl font-semibold">DIA</h1>

      {/* Rod-Toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setRod('mirror')}
          className={`rounded-2xl px-4 py-2 ${
            rod === 'mirror' ? 'bg-white text-black' : 'bg-zinc-700'
          }`}
        >
          Mirror steel rod
        </button>
        <button
          onClick={() => setRod('brass')}
          className={`rounded-2xl px-4 py-2 ${
            rod === 'brass' ? 'bg-white text-black' : 'bg-zinc-700'
          }`}
        >
          Brass rod
        </button>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Bild */}
        <div className="rounded-2xl bg-zinc-900 p-4">
          {v?.image && (
            <Image
              data={v.image}
              className="w-full rounded-xl"
              sizes="(min-width: 48em) 50vw, 100vw"
            />
          )}
        </div>

        {/* Info + einfache Variant Picker */}
        <div>
          <h2 className="mb-2 text-2xl font-medium">{active.title}</h2>
          {v?.price && (
            <div className="mb-4 text-xl">
              <Money data={v.price} />
            </div>
          )}

          <div className="mb-4 space-y-3">
            {active.options.map((opt: any) => (
              <OptionSelect
                key={opt.name}
                name={opt.name}
                values={opt.values}
                activeProduct={active}
                variantId={variantId}
                onChange={(nextVariantId) => setVariantId(nextVariantId)}
              />
            ))}
          </div>

          <form method="post" action="/cart">
            <input type="hidden" name="id" value={variantId} />
            <button
              className="rounded-2xl bg-white px-5 py-3 font-medium text-black"
              disabled={!v?.availableForSale}
            >
              {v?.availableForSale ? 'Add to cart' : 'Sold out'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function OptionSelect({
  name,
  values,
  activeProduct,
  variantId,
  onChange,
}: {
  name: string;
  values: string[];
  activeProduct: any;
  variantId: string;
  onChange: (nextVariantId: string) => void;
}) {
  const currentSelected = getSelectedOptionsFromVariantId(
    activeProduct,
    variantId,
  );
  const selectedValue = currentSelected[name];

  function handle(value: string) {
    const nextSelected = {...currentSelected, [name]: value};
    const next = findVariantBySelectedOptions(activeProduct, nextSelected);
    if (next) onChange(next.id);
  }

  return (
    <label className="block">
      <span className="mb-1 block text-sm opacity-80">{name}</span>
      <select
        className="w-full rounded-xl bg-zinc-800 px-3 py-2"
        value={selectedValue}
        onChange={(e) => handle(e.target.value)}
      >
        {values.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </label>
  );
}

function getSelectedOptionsFromVariantId(product: any, variantId: string) {
  const v = product.variants.nodes.find((x: any) => x.id === variantId);
  const out: Record<string, string> = {};
  (v?.selectedOptions ?? []).forEach((o: any) => (out[o.name] = o.value));
  return out;
}

function findVariantBySelectedOptions(
  product: any,
  selected: Record<string, string>,
) {
  return product.variants.nodes.find((v: any) =>
    v.selectedOptions.every((o: any) => selected[o.name] === o.value),
  );
}

const DIA_BY_HANDLES = `#graphql
  query DiaByHandles($mirror: String!, $brass: String!) {
    mirror: product(handle: $mirror) {
      id
      handle
      title
      options { name values }
      variants(first: 250) {
        nodes {
          id
          availableForSale
          selectedOptions { name value }
          price { amount currencyCode }
          image { url altText }
        }
      }
    }
    brass: product(handle: $brass) {
      id
      handle
      title
      options { name values }
      variants(first: 250) {
        nodes {
          id
          availableForSale
          selectedOptions { name value }
          price { amount currencyCode }
          image { url altText }
        }
      }
    }
  }
`;
