import {useState, Suspense} from 'react';
import {Link, NavLink, Await, useLocation} from 'react-router';
import {useAside} from '~/patterns/Aside';
import {normalizeMenuUrl} from 'utils/normalizeMenuUrl';
import './header.scss';

export function Header({
  header,
  variant = 'default',
  publicStoreDomain,
  primaryDomainUrl,
  cart,
  language = 'DE',
}) {
  const {menu} = header;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // 1) Active language robust ermitteln (URL gewinnt vor Prop)
  const current = (() => {
    const sp = new URLSearchParams(location.search);

    // Hydrogen-Style: ?_=en / ?_=de
    const q = sp.get('_')?.toLowerCase();
    if (q === 'en') return 'EN';
    if (q === 'de') return 'DE';

    // optional prefixes
    if (location.pathname.startsWith('/en')) return 'EN';
    if (location.pathname.startsWith('/de')) return 'DE';

    // fallback: prop
    const prop = String(language).toUpperCase();
    if (prop === 'EN') return 'EN';
    if (prop === 'DE') return 'DE';

    // IMPORTANT: Kundenwunsch "EN default"
    return 'DE';
  })();
  const redirectTo = `${location.pathname}${location.search}${location.hash || ''}`;

  const deHref = `/locale/DE?redirectTo=${encodeURIComponent(redirectTo)}`;
  const enHref = `/locale/EN?redirectTo=${encodeURIComponent(redirectTo)}`;
  const targetLang = current === 'EN' ? 'DE' : 'EN';
  const langHref = `/locale/${targetLang}?redirectTo=${encodeURIComponent(redirectTo)}`;

  return (
    <Suspense fallback={null}>
      <Await resolve={cart}>
        {(c) => {
          const count = c?.totalQuantity ?? 0;
          const hasCart = count >= 1;

          return (
            <header className={`header ${variant ? `header--${variant}` : ''}`}>
              <div
                className={`header__container ${
                  hasCart ? 'header__container--has-cart' : ''
                }`}
              >
                <div className="header__left">
                  <NavLink to="/">N</NavLink>
                </div>

                <div className="header__center">
                  <button
                    className={`burger ${isMenuOpen ? 'active' : ''} ${
                      hasCart ? 'burger--inverted' : ''
                    }`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                  >
                    <span />
                    <span />
                    <span />
                  </button>
                </div>

                <div className="header__right">
                  <NavLink to="/">C</NavLink>

                  <div className="header__cart">
                    <Link to="/cart">{hasCart ? `(${count})` : null}</Link>
                  </div>
                </div>
              </div>

              <div className={`header__overlay ${isMenuOpen ? 'open' : ''}`}>
                <nav className="header__overlay__menu">
                  {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
                    const url = normalizeMenuUrl(
                      item.url,
                      publicStoreDomain,
                      primaryDomainUrl,
                    );
                    return (
                      <NavLink
                        key={item.id}
                        to={url}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.title}
                      </NavLink>
                    );
                  })}

                  {/* optional: also inside overlay menu */}
                  {/* Language Switcher (Bottom) */}
                  <div
                    className="header__overlay__language"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      to={deHref}
                      onClick={() => setIsMenuOpen(false)}
                      className={`lang-link ${current === 'DE' ? 'is-active' : ''}`}
                    >
                      DEUTSCH
                    </Link>

                    <Link
                      to={enHref}
                      onClick={() => setIsMenuOpen(false)}
                      className={`lang-link ${current === 'EN' ? 'is-active' : ''}`}
                    >
                      ENGLISH
                    </Link>
                  </div>
                </nav>
              </div>
            </header>
          );
        }}
      </Await>
    </Suspense>
  );
}

const FALLBACK_HEADER_MENU = {
  items: [
    {id: '1', title: 'COLLECTION', url: '/collections'},
    {id: '2', title: 'PROJECTS', url: '/projects'},
    {id: '3', title: 'BESPOKE', url: '/bespoke'},
    // {id: '4', title: 'MATERIALS', url: '/materials'},
    {id: '5', title: 'ABOUT', url: '/about'},
  ],
};

/**
 * @param {{
 *   menu: HeaderProps['header']['menu'];
 *   primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
 *   viewport: Viewport;
 *   publicStoreDomain: HeaderProps['publicStoreDomain'];
 * }}
 */
export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={close}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url = normalizeMenuUrl(
          item.url,
          publicStoreDomain,
          primaryDomainUrl,
        );

        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

/**
 * @param {Pick<HeaderProps, 'isLoggedIn' | 'cart'>}
 */
// function HeaderCtas({isLoggedIn, cart}) {
//   return (
//     <nav className="header-ctas" role="navigation">
//       <HeaderMenuMobileToggle />
//       <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
//         <Suspense fallback="Sign in">
//           <Await resolve={isLoggedIn} errorElement="Sign in">
//             {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
//           </Await>
//         </Suspense>
//       </NavLink>
//       <SearchToggle />
//       <CartToggle cart={cart} />
//     </nav>
//   );
// }

// function HeaderMenuMobileToggle() {
//   const {open} = useAside();
//   return (
//     <button
//       className="header-menu-mobile-toggle reset"
//       onClick={() => open('mobile')}
//     >
//       <h3>☰</h3>
//     </button>
//   );
// }

// function SearchToggle() {
//   const {open} = useAside();
//   return (
//     <button className="reset" onClick={() => open('search')}>
//       Search
//     </button>
//   );
// }

/**
 * @param {{count: number | null}}
 */
// function CartBadge({count}) {
//   const {open} = useAside();
//   const {publish, shop, cart, prevCart} = useAnalytics();

//   return (
//     <a
//       href="/cart"
//       onClick={(e) => {
//         e.preventDefault();
//         open('cart');
//         publish('cart_viewed', {
//           cart,
//           prevCart,
//           shop,
//           url: window.location.href || '',
//         });
//       }}
//     >
//       Cart {count === null ? <span>&nbsp;</span> : count}
//     </a>
//   );
// }

/**
 * @param {Pick<HeaderProps, 'cart'>}
 */
// function CartToggle({cart}) {
//   return (
//     <Suspense fallback={<CartBadge count={null} />}>
//       <Await resolve={cart}>
//         <CartBanner />
//       </Await>
//     </Suspense>
//   );
// }

// function CartBanner() {
//   const originalCart = useAsyncValue();
//   const cart = useOptimisticCart(originalCart);
//   return <CartBadge count={cart?.totalQuantity ?? 0} />;
// }

// const FALLBACK_HEADER_MENU = {
//   id: 'gid://shopify/Menu/199655587896',
//   items: [
//     {
//       id: 'gid://shopify/MenuItem/461609500728',
//       resourceId: null,
//       tags: [],
//       title: 'Collections',
//       type: 'HTTP',
//       url: '/collections',
//       items: [],
//     },
//     {
//       id: 'gid://shopify/MenuItem/461609533496',
//       resourceId: null,
//       tags: [],
//       title: 'Blog',
//       type: 'HTTP',
//       url: '/blogs/journal',
//       items: [],
//     },
//     {
//       id: 'gid://shopify/MenuItem/461609566264',
//       resourceId: null,
//       tags: [],
//       title: 'Policies',
//       type: 'HTTP',
//       url: '/policies',
//       items: [],
//     },
//     {
//       id: 'gid://shopify/MenuItem/461609599032',
//       resourceId: 'gid://shopify/Page/92591030328',
//       tags: [],
//       title: 'About',
//       type: 'PAGE',
//       url: '/pages/about',
//       items: [],
//     },
//   ],
// };

/**
 * @param {{
 *   isActive: boolean;
 *   isPending: boolean;
 * }}
 */
function activeLinkStyle({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}

/** @typedef {'desktop' | 'mobile'} Viewport */
/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('@shopify/hydrogen').CartViewPayload} CartViewPayload */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
