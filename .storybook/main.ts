import type { StorybookConfig } from '@storybook/nextjs';
import tsConfig from '../tsconfig.json';

const webpackAliases = Object.keys(tsConfig.compilerOptions.paths).reduce(
	(aliases, key) => {
		const path = tsConfig.compilerOptions.paths[key][0]
			.replace('/*', '')
			.replace('./', '../');
		const pathKey = key.replace('/*', '');

		if (key === 'react') return aliases;

		return {
			...aliases,
			[pathKey]: require('path').resolve(__dirname, path),
		};
	},
	{}
);

const config: StorybookConfig = {
	stories: [
		'../src/**/*.mdx',
		'../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
		'../wordpress/**/*.stories.@(js|jsx|mjs|ts|tsx)',
	],
	addons: ['@storybook/addon-essentials'],
	framework: {
		name: '@storybook/nextjs',
		options: {},
	},
	docs: {
		autodocs: 'tag',
	},
	// Alias resolution
	webpackFinal: async (config: any) => {
		config.resolve.alias = {
			...config.resolve.alias,
			...webpackAliases,
		};
		return config;
	},
	staticDirs: [
		{
			from: '../src/fonts',
			to: 'src/fonts',
		},
	],
};
export default config;
