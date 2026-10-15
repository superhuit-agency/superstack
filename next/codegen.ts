import type { CodegenConfig } from '@graphql-codegen/cli';

type TemplateLiteral = {
	quasis: Array<{ value: { cooked?: string | null; raw: string } }>;
};

const pluckConfig = {
	globalGqlIdentifierName: 'gql',
	// Interpolations are erased, nested ones included: a fragment is spread by
	// name and defined in a `gql` document of its own, and the fields added in
	// multilang mode only (`${languageFields}`…) are left out, as in the
	// single-language schema. (graphql-tag-pluck's own regex stops at the
	// first `}` of a nested template.)
	pluckStringFromFile: (_code: string, node: TemplateLiteral) =>
		node.quasis.map(({ value }) => value.cooked ?? value.raw).join(''),
};

/**
 * Types for the GraphQL documents written with `gql` (`@/utils`), generated
 * from the committed schema snapshot, so neither `tsc` nor a build needs a
 * running WordPress. See docs/fse-templating.md#typed-queries.
 *
 * - `npm run generate:types` regenerates `src/__generated__/graphql.ts`.
 * - `npm run generate:schema` refreshes `schema.graphql` from the local
 *   WordPress, after a plugin or a theme change adds or changes types.
 */
const config: CodegenConfig = {
	schema: 'schema.graphql',
	documents: [
		'src/**/*.{ts,tsx}',
		'!src/**/*.d.ts',
		'!src/**/*.test.{ts,tsx}',
		'!src/__generated__/**',
	],
	pluckConfig,
	generates: {
		'src/__generated__/graphql.ts': {
			plugins: ['typescript-operations'],
			config: {
				dedupeOperationSuffix: true,
			},
		},
	},
};

export default config;
