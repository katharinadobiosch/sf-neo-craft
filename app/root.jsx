import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import favicon from '~/assets/favicon.svg';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import baseStyles from '~/styles/base/_base.scss?url';
import formStyles from '~//styles/base/_form.scss?url';
import resetStyles from '~/styles/base/_reset.scss?url';
import typographyStyles from '~/styles/base/_typography.scss?url';
import structureStyles from '~/styles/layout/_structure.scss?url';
import variablesStyles from '~/styles/utils/_variables.scss?url';

import headerStyles from '~/patterns/Header/header.scss?url';
import footerStyles from '~/patterns/Footer/footer.scss?url';
import searchStyles from '~/patterns/Search/search.scss?url';
import asideStyles from '~/patterns/Aside/aside.scss?url';
import cartStyles from '~/patterns/Cart/cart.scss?url';
import teaserDuoHomepageStyles from '~/patterns/TeaserDuoHomepage/teaserDuoHomepage.scss?url';
import teaserDuoStyles from '~/patterns/TeaserDuo/teaserDuo.scss?url';
import heroSplitStyles from '~/patterns/HeroSplit/heroSplit.scss?url';
import pdpStyles from '~/patterns/ProductDetailInformation/productDetailInformation.scss?url';
import mediaGalleryStyles from '~/patterns/MediaGallery/mediaGallery.scss?url';
import configuratorStyles from '~/patterns/Configurator/configurator.scss?url';
import swiperCss from 'swiper/css?url';
import swiperPaginationCss from 'swiper/css/pagination?url';
import mediaGalleryCss from '~/patterns/MediaGallery/mediaGallery.scss?url';
import ProductMetaAccordionCss from '~/patterns/ProductMetaAccordion/ProductMetaAccordion.scss?url';
import bespokeStyles from '~/patterns/Bespoke/bespoke.scss?url';
import highlightsStyles from '~//patterns/Highlights/highlights.scss?url';
import materialStyles from '~/patterns/Material/material.scss?url';

import appStyles from '~/styles/main.scss?url';

import {PageLayout} from './patterns/PageLayoout';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({formMethod, currentUrl, nextUrl}) => {
  if (formMethod && formMethod !== 'GET') return true;
  if (currentUrl.toString() === nextUrl.toString()) return true;
  if (currentUrl.search !== nextUrl.search) return true; // <— wichtig
  if (currentUrl.pathname !== nextUrl.pathname) return true;
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'stylesheet', href: resetStyles},
    {rel: 'stylesheet', href: appStyles},
    {rel: 'stylesheet', href: headerStyles},
    {rel: 'stylesheet', href: footerStyles},
    {rel: 'stylesheet', href: searchStyles},
    {rel: 'stylesheet', href: asideStyles},
    {rel: 'stylesheet', href: cartStyles},
    {rel: 'stylesheet', href: baseStyles},
    {rel: 'stylesheet', href: formStyles},
    {rel: 'stylesheet', href: typographyStyles},
    {rel: 'stylesheet', href: structureStyles},
    {rel: 'stylesheet', href: variablesStyles},
    {rel: 'stylesheet', href: teaserDuoHomepageStyles},
    {rel: 'stylesheet', href: teaserDuoStyles},
    {rel: 'stylesheet', href: heroSplitStyles},
    {rel: 'stylesheet', href: pdpStyles},
    {rel: 'stylesheet', href: mediaGalleryStyles},
    {rel: 'stylesheet', href: configuratorStyles},
    {rel: 'stylesheet', href: swiperCss},
    {rel: 'stylesheet', href: swiperPaginationCss},
    {rel: 'stylesheet', href: mediaGalleryCss},
    {rel: 'stylesheet', href: bespokeStyles},
    {rel: 'stylesheet', href: ProductMetaAccordionCss},
    {rel: 'stylesheet', href: highlightsStyles},
    {rel: 'stylesheet', href: materialStyles},
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'new-shop__main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

/**
 * @param {{children?: React.ReactNode}}
 */
export function Layout({children}) {
  const nonce = useNonce();
  /** @type {RootLoader} */
  const data = useRouteLoaderData('root');

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body>
        {data ? (
          <Analytics.Provider
            cart={data.cart}
            shop={data.shop}
            consent={data.consent}
          >
            <PageLayout {...data}>{children}</PageLayout>
          </Analytics.Provider>
        ) : (
          children
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>Oops</h1>
      <h2>{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}

/** @typedef {LoaderReturnData} RootLoader */

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('react-router').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
