import type { StorybookConfig } from '@storybook/nextjs-vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import tsConfig from '../tsconfig.json' with { type: 'json' };

const storybookDir = dirname(fileURLToPath(import.meta.url));

const webpackAliases = Object.keys(tsConfig.compilerOptions.paths).reduce(
	(aliases, key) => {
		const path = tsConfig.compilerOptions.paths[key][0]
			.replace('/*', '')
			.replace('./', '../');
		const pathKey = key.replace('/*', '');

		if (key === 'react') return aliases;

		return {
			...aliases,
			[pathKey]: resolve(storybookDir, path),
		};
	},
	{}
);

// Not defined in tsconfig paths, but used by CSS imports like:
// @import '@resources/index.css';
const storybookAliases = {
	...webpackAliases,
	'@resources': resolve(storybookDir, '../src/css/resources'),
};

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	framework: '@storybook/nextjs-vite',
	staticDirs: [
		'../public',
		// {
		//   from: '../src/fonts',
		//   to: 'src/fonts',
		// },
	],
	addons: [],
	// Alias resolution
	viteFinal: async (config: any) => {
		config.resolve.alias = {
			...config.resolve.alias,
			...storybookAliases,
		};
		return config;
	},
};
export default config;
