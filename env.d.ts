/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />

import '@total-typescript/ts-reset';

import type {HydrogenSessionData, HydrogenEnv} from '@shopify/hydrogen';
import type {createAppLoadContext} from '~/lib/context';

declare global {
  const process: {env: {NODE_ENV: 'production' | 'development'}};

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Env extends HydrogenEnv {}
}

declare module 'react-router' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AppLoadContext
    extends Awaited<ReturnType<typeof createAppLoadContext>> {}

  interface LoaderFunctionArgs {
    context: AppLoadContext;
  }

  interface ActionFunctionArgs {
    context: AppLoadContext;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface SessionData extends HydrogenSessionData {}
}
