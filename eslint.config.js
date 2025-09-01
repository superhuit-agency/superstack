import nextPlugin from '@next/eslint-plugin-next';
import importPlugin from 'eslint-plugin-import';
import lodashPlugin from 'eslint-plugin-lodash';
import storybook from 'eslint-plugin-storybook';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import tsParser from '@typescript-eslint/parser';

export default [
	...storybook.configs['flat/recommended'],
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		plugins: {
			next: nextPlugin,
			import: importPlugin,
			lodash: lodashPlugin,
			'unused-imports': unusedImportsPlugin,
		},
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		settings: {
			'import/resolver': {
				typescript: {
					alwaysTryTypes: true,
				},
				node: {
					extensions: ['.js', '.jsx', '.ts', '.tsx'],
				},
			},
		},
		rules: {
			'import/no-anonymous-default-export': 'off',
			'lodash/import-scope': ['error', 'method'],
			'no-unused-vars': 'off',
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'error',
				{
					vars: 'all',
					varsIgnorePattern: '^_',
					args: 'after-used',
					argsIgnorePattern: '^_',
				},
			],
			'import/no-named-as-default-member': 'off',
			'import/namespace': ['error', { allowComputed: true }],
			'import/no-cycle': 'error',
			'import/no-self-import': 'error',
			'import/no-useless-path-segments': 'error',
			'import/order': [
				'error',
				{
					groups: [
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
					],
					'newlines-between': 'always',
					alphabetize: {
						order: 'asc',
						caseInsensitive: true,
					},
				},
			],
		},
	},
];
