/**
 * IMPORTANT:
 *
 * Storefront Codegen intentionally EXCLUDES everything under ./app/graphql/**.
 *
 * - Storefront GraphQL queries & fragments MUST live outside of app/graphql/
 *   (e.g. in app/routes/** or app/queries/storefront/**),
 *   otherwise Codegen will NOT see them.
 *
 * - app/graphql/** is reserved for:
 *   - customer-account GraphQL documents
 *   - scripts, exporters, generated artifacts (e.g. metafield dumps)
 *
 * If you add a Storefront fragment/query under app/graphql/,
 * Codegen will fail or silently ignore it.
 */

import {getSchema} from '@shopify/hydrogen-codegen';

/**
 * GraphQL Config
 * @see https://the-guild.dev/graphql/config/docs/user/usage
 * @type {IGraphQLConfig}
 */
export default {
  projects: {
    default: {
      schema: getSchema('storefront'),
      documents: [
        './*.{ts,tsx,js,jsx}',
        './app/**/*.{ts,tsx,js,jsx}',
        '!./app/graphql/**/*.{ts,tsx,js,jsx}',
      ],
    },

    customer: {
      schema: getSchema('customer-account'),
      documents: ['./app/graphql/customer-account/*.{ts,tsx,js,jsx}'],
    },

    // Add your own GraphQL projects here for CMS, Shopify Admin API, etc.
  },
};

/** @typedef {import('graphql-config').IGraphQLConfig} IGraphQLConfig */
