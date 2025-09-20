import {HydratedRouter} from 'react-router/dom';
import {startTransition, StrictMode} from 'react';
import {hydrateRoot} from 'react-dom/client';

if (!window.location.origin.includes('webcache.googleusercontent.com')) {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>,
    );
  });
}

export const links = () => [
  {
    rel: 'preload',
    as: 'font',
    href: '/fonts/GTFGoodSansTRIAL-Regular.otf',
    type: 'font/otf',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'preload',
    as: 'font',
    href: '/fonts/GTFGoodSansTRIAL-Bold.otf',
    type: 'font/otf',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'preload',
    as: 'font',
    href: '/fonts/GTFGoodSansTRIAL-Light.otf',
    type: 'font/otf',
    crossOrigin: 'anonymous',
  },
];
