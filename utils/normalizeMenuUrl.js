export function normalizeMenuUrl(url, publicDomain, primaryDomain) {
  if (!url) return '/';

  try {
    const isAbsolute = url.startsWith('http://') || url.startsWith('https://');
    const domainMatch =
      url.includes('myshopify.com') ||
      (publicDomain && url.includes(publicDomain)) ||
      (primaryDomain && url.includes(primaryDomain));

    const path = isAbsolute && domainMatch ? new URL(url).pathname : url;

    const redirects = {
      '/pages/about': '/about',
      '/pages/contact': '/contact',
      '/pages/impressum': '/impressum',
      '/pages/bespoke': '/bespoke',
      '/pages/materials': '/materials',
      '/pages/main-collection': '/main-collection',
      '/blogs/projects': '/projects',
    };

    return redirects[path] || path;
  } catch {
    console.warn('Invalid URL in menu:', url);
    return '/';
  }
}
