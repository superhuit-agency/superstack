const path = require('path');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/** Strip css-loader module source from error messages so only the real error shows. */
class CleanCSSErrorsPlugin {
	apply(compiler) {
		compiler.hooks.afterCompile.tap('CleanCSSErrors', (compilation) => {
			for (const error of compilation.errors) {
				if (!error.message || error.message.length < 1000) continue;

				const lines = error.message.split('\n');
				const kept = [];
				for (const line of lines) {
					if (
						line.includes('___CSS_LOADER') ||
						line.includes('sourceMappingURL') ||
						line.startsWith('","sourceRoot"')
					)
						break;
					kept.push(line);
				}
				if (kept.length < lines.length) {
					error.message = kept.join('\n');
				}
			}
		});
	}
}

module.exports = {
	...defaultConfig,
	stats: {
		preset: 'errors-warnings',
		assets: true,
		entrypoints: true,
		errorDetails: false,
		moduleTrace: false,
	},
	resolve: {
		...defaultConfig.resolve,
		alias: {
			...(defaultConfig.resolve?.alias || {}),
			'@': path.resolve(__dirname, '../../next/src'),
			'#': path.resolve(__dirname, './theme/lib/editor/'),
		},
	},
	output: {
		...defaultConfig.output,
		filename: (pathData) => {
			// Get the original filename from default config
			const originalFilename =
				defaultConfig.output.filename || '[name].js';
			let filename;
			if (typeof originalFilename === 'function') {
				filename = originalFilename(pathData);
			} else {
				// Handle template string like [name].js
				const chunkName = pathData.chunk.name || 'main';
				filename = originalFilename.replace('[name]', chunkName);
			}
			// Replace .ts.js with .js
			return filename.replace(/\.ts\.js$/, '.js');
		},
		chunkFilename: (pathData) => {
			// Get the original chunkFilename from default config
			const originalChunkFilename =
				defaultConfig.output.chunkFilename || '[id].js';
			let filename;
			if (typeof originalChunkFilename === 'function') {
				filename = originalChunkFilename(pathData);
			} else {
				const chunkId =
					pathData.chunk.id || pathData.chunk.name || 'main';
				filename = originalChunkFilename
					.replace('[id]', chunkId)
					.replace('[name]', pathData.chunk.name || chunkId);
			}
			// Replace .ts.js with .js
			return filename.replace(/\.ts\.js$/, '.js');
		},
	},
	plugins: [
		new CleanCSSErrorsPlugin(),
		...defaultConfig.plugins.map((plugin) => {
			// Override MiniCssExtractPlugin to use .css instead of .ts.css
			if (plugin instanceof MiniCssExtractPlugin) {
				const originalFilename =
					plugin.options.filename || '[name].css';
				const originalChunkFilename =
					plugin.options.chunkFilename || '[id].css';

				return new MiniCssExtractPlugin({
					filename: (pathData) => {
						// Use the original filename function/template, then replace .ts.css with .css
						let filename;
						if (typeof originalFilename === 'function') {
							filename = originalFilename(pathData);
						} else {
							// Handle template string like [name].css
							const chunkName = pathData.chunk.name || 'main';
							filename = originalFilename.replace(
								'[name]',
								chunkName
							);
						}
						// Replace .ts.css with .css
						return filename.replace(/\.ts\.css$/, '.css');
					},
					chunkFilename: (pathData) => {
						// Use the original chunkFilename function/template, then replace .ts.css with .css
						let filename;
						if (typeof originalChunkFilename === 'function') {
							filename = originalChunkFilename(pathData);
						} else {
							const chunkId =
								pathData.chunk.id ||
								pathData.chunk.name ||
								'main';
							filename = originalChunkFilename
								.replace('[id]', chunkId)
								.replace(
									'[name]',
									pathData.chunk.name || chunkId
								);
						}
						// Replace .ts.css with .css
						return filename.replace(/\.ts\.css$/, '.css');
					},
				});
			}
			return plugin;
		}),
	],
};
