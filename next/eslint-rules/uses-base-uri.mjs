/**
 * Block data modules (`data.ts`) that read the Base URI must declare
 * `export const usesBaseUri = true;`, or a function of the block's attributes,
 * so the cached block-data wrapper adds the Base URI to their cache key. See
 * `docs/fse-templating.md`, "Caching block data".
 */

const BASE_URI_MODULE = /(^|\/)use-base-uri$/;

const importsBaseUriContext = (node) =>
	node.type === 'ImportDeclaration' &&
	BASE_URI_MODULE.test(node.source.value) &&
	node.specifiers.some(
		(specifier) =>
			specifier.type === 'ImportNamespaceSpecifier' ||
			(specifier.type === 'ImportSpecifier' &&
				specifier.imported.name === 'baseUriContext')
	);

const isOptIn = (init) =>
	(init?.type === 'Literal' && init.value === true) ||
	init?.type === 'ArrowFunctionExpression' ||
	init?.type === 'FunctionExpression';

const declaresUsesBaseUri = (node) =>
	node.type === 'ExportNamedDeclaration' &&
	((node.declaration?.type === 'FunctionDeclaration' &&
		node.declaration.id?.name === 'usesBaseUri') ||
		(node.declaration?.type === 'VariableDeclaration' &&
			node.declaration.declarations.some(
				(declarator) =>
					declarator.id.type === 'Identifier' &&
					declarator.id.name === 'usesBaseUri' &&
					isOptIn(declarator.init)
			)));

/**
 * A rule reporting the first `reportOn` node of a module that has no
 * `unlessAlso` node.
 *
 * @returns {import('eslint').Rule.RuleModule}
 */
const createRule = ({ meta, messageId, reportOn, unlessAlso }) => ({
	meta: { ...meta, schema: [] },
	create(context) {
		return {
			Program(program) {
				const node = program.body.find(reportOn);

				if (node && !program.body.some(unlessAlso)) {
					context.report({ node, messageId });
				}
			},
		};
	},
});

export const requireUsesBaseUri = createRule({
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require `usesBaseUri` in block data modules that read the Base URI',
		},
		messages: {
			missing:
				'This block data reads the Base URI: add `export const usesBaseUri = true;`, ' +
				"or a function of the block's attributes. " +
				'Its data is otherwise cached once per site, so the page that fills ' +
				'the cache would leak its content into every other page.',
		},
	},
	messageId: 'missing',
	reportOn: importsBaseUriContext,
	unlessAlso: declaresUsesBaseUri,
});

export const noUnusedUsesBaseUri = createRule({
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Disallow `usesBaseUri` in block data modules that never read the Base URI',
		},
		messages: {
			unused:
				'This block data never reads the Base URI: remove `usesBaseUri`. ' +
				'It caches one entry per page for nothing, each fetched from WordPress.',
		},
	},
	messageId: 'unused',
	reportOn: declaresUsesBaseUri,
	unlessAlso: importsBaseUriContext,
});
