export function normalizeMenuUrl(url, publicDomain, primaryDomain) {
  if (!url) return '/';

  try {
    const isAbsolute = url.startsWith('http://') || url.startsWith('https://');
    const domainMatch =
      url.includes('myshopify.com') ||
      (publicDomain && url.includes(publicDomain)) ||
      (primaryDomain && url.includes(primaryDomain));

    return isAbsolute && domainMatch ? new URL(url).pathname : url;
  } catch (e) {
    console.warn('Invalid URL in menu:', url);
    return '/';
  }
}
