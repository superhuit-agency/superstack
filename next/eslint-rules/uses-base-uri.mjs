/**
 * Block data modules (`data.ts`) that read the Base URI must declare
 * `export const usesBaseUri = true;`, so the cached block-data wrapper adds
 * the Base URI to their cache key. Without it, the page that fills the cache
 * leaks its content into every other page (and `next build` fails on the
 * `BaseUriNotDeclaredError` guard). Declaring it without reading the Base URI
 * caches one entry per page for nothing, and asks WordPress again for each.
 */

const BASE_URI_MODULE = /(^|\/)use-base-uri$/;

const importsBaseUriContext = (node) =>
	BASE_URI_MODULE.test(node.source.value) &&
	node.specifiers.some(
		(specifier) =>
			specifier.type === 'ImportNamespaceSpecifier' ||
			(specifier.type === 'ImportSpecifier' &&
				specifier.imported.name === 'baseUriContext')
	);

const isFalse = (node) => node?.type === 'Literal' && node.value === false;

/** The `usesBaseUri` export, `null` when missing or set to `false`. */
const findUsesBaseUriExport = (program) => {
	const localInits = new Map();

	for (const node of program.body) {
		const declaration =
			node.type === 'ExportNamedDeclaration' ? node.declaration : node;
		if (declaration?.type !== 'VariableDeclaration') continue;

		for (const declarator of declaration.declarations) {
			if (declarator.id.type === 'Identifier') {
				localInits.set(declarator.id.name, declarator.init);
			}
		}
	}

	for (const node of program.body) {
		if (node.type !== 'ExportNamedDeclaration') continue;

		if (node.declaration?.type === 'VariableDeclaration') {
			const declarator = node.declaration.declarations.find(
				(d) => d.id.type === 'Identifier' && d.id.name === 'usesBaseUri'
			);
			if (declarator) return isFalse(declarator.init) ? null : node;
		}

		const specifier = node.specifiers.find(
			(s) => s.exported.name === 'usesBaseUri'
		);
		if (specifier) {
			return isFalse(localInits.get(specifier.local.name)) ? null : node;
		}
	}

	return null;
};

const analyze = (program) => ({
	contextImport:
		program.body.find(
			(node) =>
				node.type === 'ImportDeclaration' && importsBaseUriContext(node)
		) ?? null,
	usesBaseUriExport: findUsesBaseUriExport(program),
});

/** @type {import('eslint').Rule.RuleModule} */
export const requireUsesBaseUri = {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Require `usesBaseUri` in block data modules that read the Base URI',
		},
		messages: {
			missing:
				'This block data reads the Base URI: add `export const usesBaseUri = true;`. ' +
				'Its data is otherwise cached once per site, so the page that fills ' +
				'the cache would leak its content into every other page.',
		},
		schema: [],
	},
	create(context) {
		return {
			Program(program) {
				const { contextImport, usesBaseUriExport } = analyze(program);

				if (contextImport && !usesBaseUriExport) {
					context.report({
						node: contextImport,
						messageId: 'missing',
					});
				}
			},
		};
	},
};

/** @type {import('eslint').Rule.RuleModule} */
export const noUnusedUsesBaseUri = {
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
		schema: [],
	},
	create(context) {
		return {
			Program(program) {
				const { contextImport, usesBaseUriExport } = analyze(program);

				if (usesBaseUriExport && !contextImport) {
					context.report({
						node: usesBaseUriExport,
						messageId: 'unused',
					});
				}
			},
		};
	},
};

const plugin = {
	meta: { name: 'superstack' },
	rules: {
		'require-uses-base-uri': requireUsesBaseUri,
		'no-unused-uses-base-uri': noUnusedUsesBaseUri,
	},
};

export default plugin;
