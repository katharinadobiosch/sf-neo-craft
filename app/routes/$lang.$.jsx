// app/routes/$lang.$.jsx
import {redirect} from 'react-router';

export async function loader({params, request, context}) {
  const url = new URL(request.url);

  const raw = String(params.lang || '').toUpperCase();
  const language = raw === 'EN' ? 'EN' : 'DE';

  const rest = params['*'] ? String(params['*']) : '';
  const targetPath = `/${rest}` || '/';

  context.session.set('language', language);

  const headers = new Headers();
  headers.append('Set-Cookie', await context.session.commit());

  return redirect(`${targetPath}${url.search}`, {headers});
}
