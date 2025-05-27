/** @type {import('jest').Config} */
module.exports = {
	displayName: 'end-to-end',
	testEnvironment: 'node',
	testMatch: ['**/__tests__/**/*.[jt]s?(x)'],

	// Use the default ts-jest preset instead of ESM
	preset: 'ts-jest',

	// Setup files
	setupFilesAfterEnv: [],

	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
		'^\\#/(.*)$': '<rootDir>/wordpress/theme/lib/editor/$1',
	},

	transform: {
		'^.+\\.ts$': [
			'ts-jest',
			{
				// Remove ESM configuration for Node v10 compatibility
				tsconfig: {
					module: 'commonjs',
					target: 'es2018',
					sourceMap: true,
					inlineSourceMap: false,
				},
			},
		],
	},

	transformIgnorePatterns: ['/node_modules/(?!(mime|filesize)/)'],

	clearMocks: true,
	testTimeout: 30000,

	collectCoverageFrom: ['**/*.{ts,tsx}', '!**/*.d.ts', '!**/node_modules/**'],
};
