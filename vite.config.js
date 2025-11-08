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
      {find: 'cookie', replacement: 'cookie-es'}, // CJS -> ESM
    ],
  },

  css: {
    preprocessorOptions: {
      scss: {includePaths: [path.resolve(__dirname, 'app')]},
    },
  },

  build: {assetsInlineLimit: 0},

  // Nur Libs fürs Browser-Bundle prebundlen; Server-Libs raus
  optimizeDeps: {
    include: ['react-router'], // ⬅️ 'cookie' & 'set-cookie-parser' entfernen
    exclude: ['@react-router/node', '@react-router/express'],
  },

  ssr: {
    // Node-Builtins bleiben extern
    external: ['fs', 'path', 'stream'],
    // 👉 Brechstange: ALLES bundlen/transformen lassen (inkl. set-cookie-parser)
    noExternal: true,
  },
});
