/**
 * README
 * ======
 *
 * Vite is used for:
 *
 * DEV
 * ---
 * - uses Vite dev server with HMR
 * - serves assets on http://localhost:3500
 *
 * PROD
 * ---
 * - builds and optimises assets in ./theme/static
 * - fingerprints assets to invalidate browser caching (e.g. editor.37862af.js)
 * - outputs a .vite/manifest.json file which WordPress uses to enqueue correct files
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import postcssImport from 'postcss-import';
import postcssPresetEnv from 'postcss-preset-env';
import postcssMixins from 'postcss-mixins';
import postcssNested from 'postcss-nested';
import postcssSimpleVars from 'postcss-simple-vars';
import postcssExtendRule from 'postcss-extend-rule';
import postcssGapProperties from 'postcss-gap-properties';
import postcssHexRgba from 'postcss-hexrgba';
import postcssNormalize from 'postcss-normalize';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Load the CJS clamp mixin via a CJS-compatible require from the repo root
const _require = createRequire(import.meta.url);
const { clamp } = _require('../src/css/mixins/clamp.js');

const rootDir = path.resolve(__dirname, '..');

const VITE_PORT = 3500;

const camelCaseDash = (string) =>
	string.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());

const wplib = [
	'a11y',
	'api-fetch',
	'blob',
	'block-editor',
	'blocks',
	'components',
	'compose',
	'core-data',
	'data',
	'date',
	'dom-ready',
	'edit-post',
	'editor',
	'element',
	'hooks',
	'html-entities',
	'i18n',
	'keycodes',
	'plugins',
	'rich-text',
	'url',
	'utils',
	'viewport',
];

/**
 * Map @wordpress/* package names to their corresponding wp.* window globals,
 * plus other well-known globals that WordPress or Gutenberg already load on
 * the page.  This is the Vite equivalent of webpack's `externals` option.
 *
 * All expressions use window.XXX so that the generated
 *   const React = window.React;
 * cannot trigger a temporal-dead-zone error when the local variable name
 * would otherwise shadow the bare global name.
 */
const wpGlobals = wplib.reduce(
	(globals, name) => ({
		...globals,
		[`@wordpress/${name}`]: `window.wp.${camelCaseDash(name)}`,
	}),
	{
		wp: 'window.wp',
		ga: 'window.ga', // Old Google Analytics
		gtag: 'window.gtag', // New Google Analytics
		react: 'window.React', // React is available via Gutenberg
		jquery: 'window.jQuery', // jQuery is enqueued by WordPress
		'react-dom': 'window.ReactDOM',
		cgbGlobal: 'window.cgbGlobal', // localized data
	}
);

/**
 * Convert an ES module import clause to a JavaScript destructuring clause.
 * Handles aliased imports:  { foo as bar }  →  { foo: bar }
 */
function importClauseToDestructure(clause) {
	return clause.replace(/(\w+)\s+as\s+(\w+)/g, '$1: $2');
}

/**
 * Vite plugin: WordPress externals
 *
 * Replaces `import … from '@wordpress/…'` (and the other mapped packages)
 * with direct references to their window globals **before** Vite's own import
 * analysis runs.  This prevents Vite from trying to resolve or bundle packages
 * that WordPress already provides on the page, mirroring webpack's `externals`.
 *
 * Handles:
 *   import X from 'pkg'              → const X = global;
 *   import { X, Y } from 'pkg'       → const { X, Y } = global;
 *   import { X as Z } from 'pkg'     → const { X: Z } = global;
 *   import * as ns from 'pkg'        → const ns = global;
 *   import type { … } from 'pkg'     → (removed – type-only)
 *   import 'pkg'                      → (removed – side-effect only)
 */
function wordpressExternals(globalsMap) {
	const entries = Object.entries(globalsMap);

	return {
		name: 'vite-wordpress-externals',
		enforce: 'pre',
		transform(code, id) {
			if (!/\.(tsx?|jsx?)$/.test(id)) return null;

			let result = code;

			for (const [pkg, globalExpr] of entries) {
				const esc = pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

				// 1. Side-effect-only import:  import 'pkg'
				result = result.replace(
					new RegExp(`import\\s+['"]${esc}['"]\\s*;?`, 'g'),
					''
				);

				// 2. Type-only import:  import type { … } from 'pkg'
				result = result.replace(
					new RegExp(
						`import\\s+type\\s+\\{[^}]*\\}\\s+from\\s+['"]${esc}['"]\\s*;?`,
						'g'
					),
					''
				);

				// 3. Named import (multiline-safe):  import { X, Y } from 'pkg'
				//    Also handles aliases:  import { X as Z } from 'pkg' → { X: Z }
				result = result.replace(
					new RegExp(
						`import\\s+(\\{[^}]*\\})\\s+from\\s+['"]${esc}['"]\\s*;?`,
						'g'
					),
					(_, clause) =>
						`const ${importClauseToDestructure(clause)} = ${globalExpr};`
				);

				// 4. Namespace import:  import * as ns from 'pkg'
				result = result.replace(
					new RegExp(
						`import\\s+\\*\\s+as\\s+(\\w+)\\s+from\\s+['"]${esc}['"]\\s*;?`,
						'g'
					),
					(_, ns) => `const ${ns} = ${globalExpr};`
				);

				// 5. Default import:  import X from 'pkg'
				result = result.replace(
					new RegExp(
						`import\\s+(\\w+)\\s+from\\s+['"]${esc}['"]\\s*;?`,
						'g'
					),
					(_, name) => `const ${name} = ${globalExpr};`
				);
			}

			return result !== code ? { code: result, map: null } : null;
		},
	};
}

export default defineConfig({
	plugins: [
		wordpressExternals(wpGlobals),
		// Use classic JSX runtime so that JSX compiles to React.createElement()
		// rather than importing from react/jsx-runtime (which is not available
		// as a WordPress global).  The wordpressExternals plugin maps
		// `import React from 'react'` → `const React = window.React;`.
		react({ jsxRuntime: 'classic' }),
		process.env.ANALYZE &&
			visualizer({
				open: true,
				filename: 'theme/static/stats.html',
			}),
	].filter(Boolean),

	resolve: {
		alias: {
			'@resources': path.resolve(__dirname, '../src/css/resources'),
			'@': path.resolve(__dirname, '../src/'),
			'#': path.resolve(__dirname, './theme/lib/editor/'),
		},
		extensions: ['.tsx', '.ts', '.js', '.jsx', '.css'],
	},

	css: {
		postcss: {
			plugins: [
				postcssImport({
					resolve(id, basedir) {
						// Resolve the @resources alias → src/css/resources/<path>
						if (/^@resources(\/|$)/.test(id))
							return path.resolve(
								rootDir,
								'src/css/resources',
								id.replace(/^@resources\/?/, '')
							);
						// Resolve @-scoped npm packages from the repo-root node_modules
						if (/^@/.test(id))
							return path.resolve(rootDir, 'node_modules', id);
						// Default: resolve relative to the current file
						return path.resolve(basedir, id);
					},
				}),
				postcssPresetEnv({
					autoprefixer: { flexbox: 'no-2009' },
					stage: 3,
				}),
				postcssMixins({ mixins: { clamp } }),
				postcssNested(),
				postcssSimpleVars(),
				postcssExtendRule(),
				postcssGapProperties(),
				postcssHexRgba(),
				postcssNormalize(),
			],
		},
	},

	// Prevent Vite from pre-bundling WordPress packages that are handled by
	// the wordpressExternals plugin at transform time.
	optimizeDeps: {
		exclude: [
			'@wordpress/api-fetch',
			'@wordpress/blob',
			'@wordpress/plugins',
			'@wordpress/url',
		],
	},

	build: {
		outDir: './theme/static',
		emptyOutDir: true,
		manifest: true,
		sourcemap: true,
		rollupOptions: {
			input: {
				editor: path.resolve(
					__dirname,
					'./theme/lib/editor/_loader.ts'
				),
				admin: path.resolve(
					__dirname,
					'./theme/lib/admin/_loader.ts'
				),
			},
			output: {
				entryFileNames: '[name].[hash].js',
				chunkFileNames: '[name].[hash].js',
				assetFileNames: '[name].[hash][extname]',
			},
		},
	},

	server: {
		port: VITE_PORT,
		host: '0.0.0.0',
		cors: true,
		origin: `http://localhost:${VITE_PORT}`,
		hmr: {
			host: 'localhost',
			port: VITE_PORT,
		},
	},
});
