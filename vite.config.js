// vite.config.ts
import {defineConfig} from 'vite';
import {hydrogen, remix} from '@shopify/hydrogen/vite'; // ✅ remix importieren
import {oxygen} from '@shopify/mini-oxygen/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    hydrogen(),
    oxygen(),
    remix({
      presets: [hydrogen.v3preset()], // ✅ laut March-2025-Guide
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
        v3_singleFetch: true,
        v3_routeConfig: true, // ✅ wichtig für RR7
      },
    }),
    tsconfigPaths(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // ✅ kein "sscss"
        includePaths: ['./app'],
        additionalData: `@use "styles/variables" as *;\n`,
      },
    },
  },
  build: {
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      include: ['set-cookie-parser', 'cookie', 'react-router'],
    },
  },
});
