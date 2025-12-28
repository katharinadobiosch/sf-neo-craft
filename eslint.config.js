// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import {defineConfig} from 'eslint/config';
import pluginImport from 'eslint-plugin-import';

export default defineConfig([
  {
    ignores: [
      '.react-router/**',
      '**/*.generated.d.ts',
      'storefrontapi.generated.d.ts',
      'customer-accountapi.generated.d.ts',
      'env.d.ts',
      'build/**',
      'dist/**',
      'public/build/**',
      '**/*.patch',
    ],
  },
  // Basis
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: {
      import: pluginImport,
    },
    languageOptions: {globals: globals.browser},
    rules: {
      // Optional: andere Basisregeln
    },
  },

  // JS-Empfehlungen
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    ...js.configs.recommended, // @eslint/js
  },

  // TS-Empfehlungen (nur für TS-Dateien)
  {
    files: ['**/*.{ts,mts,cts,tsx}'],
    ...tseslint.configs.recommended,
  },

  // React
  {
    ...pluginReact.configs.flat.recommended,
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  // Node-Umgebung wo nötig
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // 🔔 JS/JSX: unbenutzte Variablen melden
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    rules: {
      'no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },

  // 🔔 TS/TSX: unbenutzte Variablen melden (Core-Regel aus!)
  {
    files: ['**/*.{ts,mts,cts,tsx}'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
]);
