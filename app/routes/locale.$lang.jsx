// app/routes/locale.$lang.jsx
import {redirect} from 'react-router';

/**
 * @param {import('@shopify/remix-oxygen').LoaderFunctionArgs} args
 */
export async function loader({params, request, context}) {
  const url = new URL(request.url);

  const redirectTo = url.searchParams.get('redirectTo') || '/';
  const raw = String(params.lang || '').toUpperCase();
  const language = raw === 'EN' ? 'EN' : 'DE';

  context.session.set('language', language);

  const headers = new Headers();
  headers.append('Set-Cookie', await context.session.commit());

  return redirect(redirectTo, {headers});
}
