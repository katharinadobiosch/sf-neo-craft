// app/lib/context.js
import {createHydrogenContext} from '@shopify/hydrogen';
import {AppSession} from '~/lib/session';
import {CART_QUERY_FRAGMENT} from '~/lib/fragments';

export async function createAppLoadContext(request, env, executionContext) {
  if (!env?.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    caches.open('hydrogen'),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  // ✅ language from session (default DE)
  const sessionLang = String(session.get('language') || 'DE').toUpperCase();
  const language = sessionLang === 'EN' ? 'EN' : 'DE';

  const hydrogenContext = createHydrogenContext({
    env,
    request,
    cache,
    waitUntil,
    session,
    // ✅ Keep country DE so currency stays EUR (assuming DE market is EUR)
    i18n: {language, country: 'DE'},
    cart: {queryFragment: CART_QUERY_FRAGMENT},
  });

  return {
    ...hydrogenContext,
  };
}
