/**
 * README
 * ======
 *
 * Webpack is used for:
 *
 * DEV
 * ---
 * - uses devServer which builds assets in memory and
 * - serves assets on http://localhost:5000
 *
 * PROD
 * ---
 * - builds and optimises assets in ./theme/static
 * - fingerprints assets to invalidate browser caching (i.e. build.37862af.css)
 * - outputs a manifest.json file which can be used by wordpress to serve the correct files
 */

const path = require('path');
const webpack = require('webpack');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const BundleAnalyzerPlugin =
	require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const FriendlyErrorsWebpackPlugin = require('@soda/friendly-errors-webpack-plugin');

const CONFIG = {
	build: path.resolve(__dirname, './theme/static'),
	entries: {
		editor: path.resolve(__dirname, './theme/lib/editor/_loader.ts'),
		admin: path.resolve(__dirname, './theme/lib/admin/_loader.ts'),
	},
	devServer: {
		port: 3500,
	},
};

const DEV = process.env.NODE_ENV === 'development';

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

module.exports = {
	stats: 'errors-only',
	bail: !DEV,
	mode: DEV ? 'development' : 'production',
	// We generate sourcemaps in production. This is slow but gives good results.
	// You can exclude the *.map files from the build during deployment.
	// See https://webpack.js.org/configuration/devtool/
	devtool: `${DEV ? 'eval-cheap-' : ''}source-map`,
	infrastructureLogging: {
		level: 'error',
	},
	entry: CONFIG.entries,
	resolve: {
		alias: {
			'@resources': path.resolve(__dirname, '../src/css/resources'),
			'@': path.resolve(__dirname, '../src/'),
			'#': path.resolve(__dirname, './theme/lib/editor/'),
		},
		extensions: ['.tsx', '.ts', '.js', '.jsx', '.css'],
		fallback: {
			fs: false,
			path: false,
			zlib: false,
			util: false,
			crypto: require.resolve('crypto-browserify'),
			stream: require.resolve('stream-browserify'),
			'process/browser': require.resolve('process/browser'),
		},
	},
	output: {
		path: CONFIG.build,
		publicPath: DEV ? `http://localhost:${CONFIG.devServer.port}/` : '/',
		filename: DEV ? '[name].js' : '[name].[contenthash:8].js',
	},
	// require existing gutenberg dependencies instead of bundling duplicates
	// see https://www.cssigniter.com/importing-gutenberg-core-wordpress-libraries-es-modules-blocks/
	externals: [
		wplib.reduce(
			(externals, name) => ({
				...externals,
				[`@wordpress/${name}`]: `wp.${camelCaseDash(name)}`,
			}),
			{
				wp: 'wp',
				ga: 'ga', // Old Google Analytics.
				gtag: 'gtag', // New Google Analytics.
				react: 'React', // React itself is there in Gutenberg.
				jquery: 'jQuery', // import $ from 'jquery'; // Use jQuery from WP after enqueuing it.
				'react-dom': 'ReactDOM',
				cgbGlobal: 'cgbGlobal', // import globals from 'cgbGlobal'; // Localized data.
			}
		),
		// // Lodash is there in Gutenberg. We need to transform `lodash/isEmpty` to `lodash.isEmpty`
		// function ({ context, request }, callback) {
		// 	if (/^lodash\/(.*)$/.test(request)) {
		// 		return callback(null, request.replace('/', '.'));
		// 	}

		// 	// Continue without externalizing the import
		// 	callback();
		// },
	],

	module: {
		rules: [
			{
				test: /\.(ts|tsx|js|jsx)$/,
				// exclude all node_modules
				exclude: /node_modules/,
				use: [
					{
						loader: require.resolve('babel-loader'),
						options: {
							presets: [
								require.resolve('@babel/preset-react'),
								'@babel/preset-env',
								require.resolve('@babel/preset-typescript'),
							],
						},
					},
				],
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: true,
							postcssOptions: {
								config: path.resolve(
									__dirname,
									'../postcss.config.js'
								),
								plugins: [],
							},
						},
					},
					// {
					// 	loader: 'resolve-url-loader',
					// 	options: {
					// 		root: path.join(__dirname, '../src'),
					// 	},
					// },
				],
			},
			// images
			{
				test: /\.(gif|png|jpe?g|svg|ico)$/i,
				type: 'asset',
			},
			// fonts
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/i,
				include: path.resolve(__dirname, '../src/assets/fonts'),
				type: 'asset',
				generator: {
					publicPath: DEV
						? undefined
						: `/wp-content/themes/${process.env?.THEME_NAME ?? 'superstack'}/static/`, // Only override the public path specifically for fonts on PRODUCTION
				},
			},
		],
	},
	optimization: {
		minimize: !DEV,
		minimizer: [
			new ImageMinimizerPlugin({
				minimizer: {
					implementation: ImageMinimizerPlugin.sharpMinify,
				},
			}),
		],
	},

	watchOptions: {
		ignored: /css\.d\.ts$/,
	},

	plugins: [
		process.env.ANALYZE && new BundleAnalyzerPlugin(),

		new webpack.ProvidePlugin({
			process: 'process/browser',
		}),

		new WebpackManifestPlugin(),
		new webpack.EnvironmentPlugin({
			NODE_ENV: 'development', // use 'development' unless process.env.NODE_ENV is defined
			DEBUG: false,
		}),

		// prod only
		!DEV && new CleanWebpackPlugin(),

		// dev only
		DEV && new webpack.HotModuleReplacementPlugin(),
		DEV && new FriendlyErrorsWebpackPlugin(),
	].filter(Boolean),
	devServer: {
		historyApiFallback: false,
		compress: false,
		host: '0.0.0.0',
		port: CONFIG.devServer.port,
		allowedHosts: 'all',
		hot: true,
		client: {
			overlay: true,
		},
		open: false,
		static: {
			directory: path.join(__dirname, '../src'),
		},
		headers: {
			// fix cors
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods':
				'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Headers':
				'X-Requested-With, content-type, Authorization',
		},
	},
};
