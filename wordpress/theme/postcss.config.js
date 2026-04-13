const path = require('path');
const postcssPlugins = require('@wordpress/postcss-plugins-preset');

module.exports = {
	plugins: [
		require('postcss-import'),
		require('postcss-extend-rule'),
		require('postcss-mixins')({
			mixinsDir: path.resolve(__dirname, 'src/mixins'),
		}),
		require('postcss-simple-vars')({}),
		...postcssPlugins,
	],
};
