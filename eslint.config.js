// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import {defineConfig} from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    languageOptions: {globals: globals.browser},
  },

  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    ...js.configs.recommended,
    rules: {
      'no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // WICHTIG: spread, sonst "Unexpected key 0"
  ...tseslint.configs.recommended,

  {
    ...pluginReact.configs.flat.recommended,
    settings: {react: {version: 'detect'}},
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  {
    languageOptions: {globals: {...globals.node}},
  },

  {
    ignores: [
      '.react-router/**',
      '**/*.generated.d.ts',
      'storefrontapi.generated.d.ts',
      'customer-accountapi.generated.d.ts',
      'build/**',
      'dist/**',
      'public/build/**',
    ],
  },

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
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
]);
