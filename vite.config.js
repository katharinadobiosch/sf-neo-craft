// import {defineConfig} from 'vite';
// import {hydrogen} from '@shopify/hydrogen/vite';
// import {oxygen} from '@shopify/mini-oxygen/vite';
// import {reactRouter} from '@react-router/dev/vite';
// import tsconfigPaths from 'vite-tsconfig-paths';

// export default defineConfig({
//   plugins: [hydrogen(), oxygen(), reactRouter(), tsconfigPaths()],
//   css: {
//     preprocessorOptions: {
//       scss: {
//         includePaths: ['./app'],
//         additionalData: `@use "styles/variables" as *;\n`,
//       },
//     },
//   },
//   build: {
//     // Allow a strict Content-Security-Policy
//     // withtout inlining assets as base64:
//     assetsInlineLimit: 0,
//   },
//   ssr: {
//     optimizeDeps: {
//       /**
//        * Include dependencies here if they throw CJS<>ESM errors.
//        * For example, for the following error:
//        *
//        * > ReferenceError: module is not defined
//        * >   at /Users/.../node_modules/example-dep/index.js:1:1
//        *
//        * Include 'example-dep' in the array below.
//        * @see https://vitejs.dev/config/dep-optimization-options
//        */
//       include: ['set-cookie-parser', 'cookie', 'react-router'],
//     },
//   },
// });

import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

export default defineConfig({
  plugins: [hydrogen(), oxygen(), reactRouter(), tsconfigPaths()],
  resolve: {
    alias: [
      // 👉 RR6-Server-Import -> RR7-Server-Paket
      {find: 'react-router-dom/server', replacement: '@react-router/node'},
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // WICHTIG: absolut auflösen
        includePaths: [path.resolve(__dirname, 'app')],
        // jetzt funktioniert "styles/utils/_variables"
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
