import {CartForm, Money} from '@shopify/hydrogen';
import {useRef} from 'react';
import './cart.scss';

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';
  const itemCount = cart?.totalQuantity ?? 0;

  return (
    <div aria-labelledby="cart-summary" className={className}>
      <h4>Zusammenfassung</h4>

      <dl className="cart-list">
        {/* <dt>{itemCount === 1 ? '1 Artikel' : `${itemCount} Artikel`}</dt>
        <dd>
          {cart.cost?.totalAmount?.amount ? (
            <Money data={cart.cost?.totalAmount} />
          ) : (
            '-'
          )}
        </dd> */}

        <dt>Zwischensumme</dt>
        <dd>
          {cart.cost?.subtotalAmount?.amount ? (
            <Money data={cart.cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </dd>

        <dt className="is-strong">Summe</dt>
        <dd className="is-strong">
          {cart.cost?.totalAmount?.amount ? (
            <Money data={cart.cost?.totalAmount} />
          ) : (
            '-'
          )}
        </dd>
      </dl>

      <CartDiscounts discountCodes={cart.discountCodes} />
      <CartGiftCards giftCardCodes={cart.appliedGiftCards} />

      <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
    </div>
  );
}

/** @param {{checkoutUrl?: string}} */
function CartCheckoutActions({checkoutUrl}) {
  if (!checkoutUrl) return null;

  return (
    <a className="cart-checkout" href={checkoutUrl} target="_self">
      Zur Kasse gehen
    </a>
  );
}

/** @param {{discountCodes?: CartApiQueryFragment['discountCodes'];}} */
function CartDiscounts({discountCodes}) {
  const codes =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div className="cart-extras">
      <div className="cart-extras__title">Rabatt</div>

      <div className="cart-extras__applied" hidden={!codes.length}>
        {codes.map((c) => (
          <code key={c}>{c}</code>
        ))}
      </div>

      <UpdateDiscountForm discountCodes={codes}>
        <div className="cart-code-row">
          <input type="text" name="discountCode" placeholder="Discount code" />
          <button type="submit">Apply</button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

/** @param {{discountCodes?: string[]; children: React.ReactNode;}} */
function UpdateDiscountForm({discountCodes, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{discountCodes: discountCodes || []}}
    >
      {children}
    </CartForm>
  );
}

/** @param {{giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;}} */
function CartGiftCards({giftCardCodes}) {
  // Hydrogen erwartet beim Update die "raw codes". Wir speichern die vom User eingegebenen Codes,
  // damit "Apply" konsistent bleibt, und zeigen parallel die bereits angewendeten Codes (***1234) an.
  const appliedCodesRef = useRef([]);

  const visibleCodes =
    giftCardCodes?.map(({lastCharacters}) => `***${lastCharacters}`) || [];

  return (
    <div className="cart-extras">
      <div className="cart-extras__title">Gift card</div>

      <div className="cart-extras__applied" hidden={!visibleCodes.length}>
        {visibleCodes.map((c) => (
          <code key={c}>{c}</code>
        ))}
      </div>

      <UpdateGiftCardForm appliedCodesRef={appliedCodesRef}>
        <div className="cart-code-row">
          <input type="text" name="giftCardCode" placeholder="Gift card code" />
          <button type="submit">Apply</button>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

/**
 * @param {{
 *   appliedCodesRef: {current: string[]};
 *   children: React.ReactNode;
 * }}
 */
function UpdateGiftCardForm({appliedCodesRef, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{giftCardCodes: appliedCodesRef.current || []}}
    >
      {(fetcher) => {
        const codeRaw = fetcher.formData?.get('giftCardCode')?.toString();
        if (codeRaw) {
          const formatted = codeRaw.replace(/\s/g, '');
          if (formatted && !appliedCodesRef.current.includes(formatted)) {
            appliedCodesRef.current.push(formatted);
          }
        }
        return children;
      }}
    </CartForm>
  );
}

/**
 * @typedef {{
 *   cart: OptimisticCart<CartApiQueryFragment | null>;
 *   layout: CartLayout;
 * }} CartSummaryProps
 */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/patterns/Cart/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
