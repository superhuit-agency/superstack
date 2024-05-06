const path = require('path');

const { clamp } = require('./src/css/mixins/clamp.js'); // Needs to be a Javascript file as Typescript isn't working with postcss-mixins

const rootPath = process.cwd().replace('/wordpress', '');

module.exports = {
	plugins: {
		'postcss-import': {
			resolve: (id, basedir) => {
				// resolve alias @resources, @import '@resources/style.css';
				if (/^@resources/.test(id))
					return path.resolve(
						rootPath,
						'src/css/resources',
						id.slice(11)
					);

				// resolve node_modules, @import '@package-from-node-modules/*'
				if (/^@/.test(id))
					return path.resolve(rootPath, 'node_modules', id);

				// resolve relative path, @import './components/style.css'
				return path.resolve(basedir, id);
			},
		},
		'postcss-preset-env': {
			autoprefixer: {
				flexbox: 'no-2009',
			},
			stage: 3,
		},
		'postcss-mixins': {
			mixins: {
				clamp,
			},
		},
		'postcss-nested': {},
		'postcss-simple-vars': {},
		'postcss-extend-rule': {},
		'postcss-gap-properties': {},
		'postcss-hexrgba': {},
		'postcss-normalize': {},
	},
};
