/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  return context.customerAccount.login();
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
