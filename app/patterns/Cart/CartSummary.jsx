import {Money} from '@shopify/hydrogen';
import './cart.scss';

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  const subtotal = cart?.cost?.subtotalAmount;
  const total = cart?.cost?.totalAmount;

  return (
    <div aria-labelledby="cart-summary" className={className}>
      <div className="cart-summary-grid">
        <div className="cell label">Nachricht</div>
        <div className="cell value">
          <textarea
            className="cart-note"
            placeholder="Hinterlasse eine Nachricht zu deiner Bestellung"
          />
        </div>

        <div className="cell label">Zwischensumme</div>
        <div className="cell value price">
          {subtotal?.amount ? <Money data={subtotal} /> : '—'}
        </div>

        <div className="cell label">Lieferung</div>
        <div className="cell value muted">
          Versandkosten &amp; Steuern werden beim Check-out berechnet
        </div>

        <div className="cell total">
          {total?.amount ? <Money data={total} /> : '—'}
        </div>

        <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
      </div>
    </div>
  );
}

/** @param {{checkoutUrl?: string}} */
function CartCheckoutActions({checkoutUrl}) {
  if (!checkoutUrl) {
    return <div className="cell checkout is-disabled">Zur Kasse gehen</div>;
  }

  return (
    <a
      className="cell checkout"
      href={checkoutUrl}
      target="_self"
      rel="noreferrer"
    >
      Zur Kasse gehen
    </a>
  );
}

/**
 * @typedef {{
 *   cart: import('@shopify/hydrogen').OptimisticCart<import('storefrontapi.generated').CartApiQueryFragment | null>;
 *   layout: import('~/patterns/Cart/CartMain').CartLayout;
 * }} CartSummaryProps
 */
