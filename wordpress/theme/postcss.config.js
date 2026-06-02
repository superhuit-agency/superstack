const path = require('path');

// Mixin => DO NOT FORGET TO INCLUDE AS WELL IN THE NEXT POSTCSS.CONFIG.JS
const { clamp } = require(path.resolve(__dirname, '../../next/src/css/mixins/clamp.js'));

module.exports = {
	plugins: [
		require('postcss-import')({
			resolve: (id, basedir) => {
       			// resolve alias @resources, @import '@resources/style.css';
				if (/^@resources/.test(id))
					return path.resolve(__dirname, '../../next/src/css/resources', id.slice(11));

        		// resolve node_modules, @import '@package-from-node-modules/*'
				if (/^@/.test(id)) return path.resolve(__dirname, 'node_modules', id);

       			// resolve relative path, @import './components/style.css'
				return path.resolve(basedir, id);
			},
		}),
		require('postcss-preset-env')({
			autoprefixer: {
				flexbox: 'no-2009',
			},
			stage: 3,
		}),
		require('postcss-mixins')({
			mixins: {
				clamp,
			},
		}),
		require('postcss-nested'),
		require('postcss-simple-vars'),
		require('postcss-extend-rule'),
		require('postcss-gap-properties'),
		require('postcss-hexrgba'),
		require('postcss-normalize'),
	],
};
