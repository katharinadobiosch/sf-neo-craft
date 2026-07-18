export function normalizeMenuUrl(url, publicDomain, primaryDomain) {
  if (!url) return '/';

  try {
    const isAbsolute = url.startsWith('http://') || url.startsWith('https://');

    const domainMatch =
      url.includes('myshopify.com') ||
      (publicDomain && url.includes(publicDomain)) ||
      (primaryDomain && url.includes(primaryDomain));

    let path = isAbsolute && domainMatch ? new URL(url).pathname : url;

    // Shopify localized URLs:
    // /de/pages/about -> /pages/about
    // /en/pages/about -> /pages/about
    path = path.replace(/^\/(de|en)(?=\/)/, '');

    const redirects = {
      '/pages/about': '/about',
      '/pages/contact': '/contact',
      '/pages/impressum': '/impressum',
      '/pages/bespoke': '/bespoke',
      // '/pages/materials': '/materials',
      '/pages/main-collection': '/collections/main-collection',

      '/collections/main-collection': '/collections/main-collection',
      // '/collections/materials': '/collections/materials',

      '/blogs/projects': '/projects',
    };

    return redirects[path] || path;
  } catch {
    console.warn('Invalid URL in menu:', url);
    return '/';
  }
}
