import {CartForm, Image} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {Link} from 'react-router';
import {ProductPrice} from '../ProductPrice';
import {useAside} from '~/patterns/Aside';
import './cart.scss';

/**
 * @param {{
 *   layout: CartLayout;
 *   line: CartLine;
 * }}
 */
export function CartLineItem({layout, line}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();

  return (
    <li key={id} className="cart-line">
      <div className="cart-line__media">
        {image && (
          <Image
            alt={title}
            aspectRatio="1/1"
            data={image}
            height={160}
            loading="lazy"
            width={160}
          />
        )}

        {/* Unit price under the image (TASCHEN-style) */}
        <div className="cart-line__price-block">
          <div className="cart-line__unit-price">
            <ProductPrice price={line?.cost?.amountPerQuantity} />
          </div>

          <div className="cart-line__right">
            <CartLineQuantity line={line} />
            <div className="cart-line__total">
              <ProductPrice price={line?.cost?.totalAmount} />
            </div>
          </div>
        </div>
      </div>

      <div className="cart-line__info">
        <Link
          className="cart-line__title"
          prefetch="intent"
          to={lineItemUrl}
          onClick={() => {
            if (layout === 'aside') close();
          }}
        >
          <strong>{product.title}</strong>
        </Link>

        <div className="cart-line__meta">
          {selectedOptions.map((option) => (
            <div key={option.name} className="cart-line__meta-row">
              <span className="cart-line__meta-label">{option.name}:</span>{' '}
              <span className="cart-line__meta-value">{option.value}</span>
            </div>
          ))}
        </div>

        {/* Right side: qty + total price */}
        <div className="cart-line__controls">
          {/* <CartLineQuantity line={line} /> */}

          <div className="cart-line__total"></div>
        </div>
      </div>
    </li>
  );
}

/** @param {{line: CartLine}} */
function CartLineQuantity({line}) {
  if (!line || typeof line?.quantity === 'undefined') return null;

  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Math.max(1, quantity - 1);
  const nextQuantity = quantity + 1;

  return (
    <div
      className="cart-line__qty cart-line-quantity"
      aria-label="Quantity selector"
    >
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          type="submit"
          className="qty-btn"
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
        >
          &#8722;
        </button>
      </CartLineUpdateButton>

      <span className="qty-value" aria-live="polite">
        {quantity}
      </span>

      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          type="submit"
          className="qty-btn"
          aria-label="Increase quantity"
          disabled={!!isOptimistic}
          name="increase-quantity"
          value={nextQuantity}
        >
          &#43;
        </button>
      </CartLineUpdateButton>
    </div>
  );
}

/**
 * @param {{
 *   lineIds: string[];
 *   disabled: boolean;
 * }}
 */
function CartLineRemoveButton({lineIds, disabled}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        className="cart-line__remove"
        disabled={disabled}
        type="submit"
        aria-label="Remove item"
      >
        Remove
      </button>
    </CartForm>
  );
}

/**
 * @param {{
 *   children: React.ReactNode;
 *   lines: CartLineUpdateInput[];
 * }}
 */
function CartLineUpdateButton({children, lines}) {
  const lineIds = lines.map((line) => line.id);

  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

function getUpdateKey(lineIds) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}

/** @typedef {OptimisticCartLine<CartApiQueryFragment>} CartLine */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').CartLineUpdateInput} CartLineUpdateInput */
/** @typedef {import('~/patterns/Cart/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLine} OptimisticCartLine */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
