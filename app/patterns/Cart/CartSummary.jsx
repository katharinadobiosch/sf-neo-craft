import {Money} from '@shopify/hydrogen';
import './cart.scss';

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  const subtotal = cart?.cost?.subtotalAmount;
  const checkoutUrl = cart?.checkoutUrl;
  const lines = cart?.lines?.nodes ?? [];

  const products = lines.map((line) => {
    const options = line.merchandise.selectedOptions
      .map(({name, value}) => `${name}: ${value}`)
      .join(', ');

    return [
      line.merchandise.product.title,
      `Quantity: ${line.quantity}`,
      options,
      `Product: https://neocraft.com/products/${line.merchandise.product.handle}`,
    ]
      .filter(Boolean)
      .join('\n');
  });

  const emailBody = [
    'Hello NEOCRAFT Team,',
    '',
    'I have a question about the following products:',
    '',
    ...products.flatMap((product) => [product, '']),
  ].join('\n');

  const contactHref =
    'mailto:info@neocraft.com?subject=' +
    encodeURIComponent('Product inquiry - Shopping Cart') +
    '&body=' +
    encodeURIComponent(emailBody);

  return (
    <section
      className={`nc-cart-summary nc-cart-summary--${layout}`}
      aria-label="Cart summary"
    >
      <div className="nc-cart-summary__table">
        <div className="nc-cart-summary__row">
          <div className="nc-cart-summary__label">Message</div>
          <div className="nc-cart-summary__value">
            <textarea
              className="nc-cart-summary__note"
              placeholder="Leave us a message"
              aria-label="Order message"
            />
          </div>
        </div>

        <div className="nc-cart-summary__row">
          <div className="nc-cart-summary__label">Notices</div>
          <div className="nc-cart-summary__value nc-cart-summary__notices">
            <span>Electrical Appliances - Return &amp; Disposal</span>
            <span>5-Year Manufacturer's Warranty</span>
          </div>
        </div>

        <div className="nc-cart-summary__row">
          <div className="nc-cart-summary__label">
            Shipping Information
          </div>
          <div className="nc-cart-summary__value nc-cart-summary__shipping">
            <p>
              Depending on the product, orders are shipped either as
              standard parcels or on pallets. Certain items, such as
              glass or marble coffee tables, require pallet shipping
              for safe transportation. Please note that pallet
              deliveries are available curbside only.
            </p>
            <p>
              Shipping costs are calculated at checkout based on the
              items ordered and the delivery destination. For an
              overview of shipping rates and lead times, please see
              our{' '}
              <a
                href="https://neocraft.com/pages/versandkosten"
                target="_blank"
                rel="noopener noreferrer"
              >
                Shipping &amp; Delivery
              </a>{' '}
              page.
            </p>
          </div>
        </div>

        <div className="nc-cart-summary__row">
          <div className="nc-cart-summary__label">
            Shipping Consent
          </div>
          <div className="nc-cart-summary__value">
            <label className="nc-cart-summary__consent">
              <input type="checkbox" name="shippingConsent" />
              <span>
                I agree that my e-mail address and telephone number
                may be passed on to the transport company so that
                the parcel or shipping company can contact me by
                e-mail or telephone before delivery of the goods
                for the purpose of coordinating a delivery date or
                transmitting status information on the delivery of
                the consignment. I can revoke the consent I have
                given in this regard at any time.
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="nc-cart-summary__actions">
        <div className="nc-cart-summary__subtotal">
          <span className="nc-cart-summary__arrow" aria-hidden="true">
            →
          </span>
          <div>
            <strong>
              {subtotal?.amount ? <Money data={subtotal} /> : '—'}
            </strong>
            <small>incl. VAT, plus shipping costs</small>
          </div>
        </div>

        {checkoutUrl ? (
          <a className="nc-cart-summary__action" href={checkoutUrl}>
            Check Out
          </a>
        ) : (
          <span className="nc-cart-summary__action is-disabled">
            Check Out
          </span>
        )}

        <a className="nc-cart-summary__action" href={contactHref}>
          Contact our Team
        </a>
      </div>
    </section>
  );
}

/**
 * @typedef {{
 *   cart: import('@shopify/hydrogen').OptimisticCart<import('storefrontapi.generated').CartApiQueryFragment | null>;
 *   layout: import('~/patterns/Cart/CartMain').CartLayout;
 * }} CartSummaryProps
 */
