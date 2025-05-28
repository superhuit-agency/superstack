/**
 * Jest configuration for end-to-end tests
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

const nextJest = require('next/jest');

/** @type {import('jest').Config} */
const config = {
	displayName: 'end-to-end',

	// Use Node.js environment for Puppeteer end-to-end tests
	testEnvironment: 'node',

	// Test file patterns for end-to-end tests
	testMatch: ['**/__tests__/endtoend/**/*.[jt]s?(x)'],

	// Automatically clear mock calls, instances, contexts and results before every test
	clearMocks: true,

	// Indicates whether the coverage information should be collected while executing the test
	collectCoverage: false,

	// The directory where Jest should output its coverage files
	// coverageDirectory: '',

	// An array of glob patterns indicating a set of files for which coverage information should be collected
	// collectCoverageFrom: [],

	// Configure for ES modules support
	extensionsToTreatAsEsm: ['.ts', '.tsx'],

	// Module name mapping
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
		'^\\#/(.*)$': '<rootDir>/wordpress/theme/lib/editor/$1',
		// Mock Storybook test utilities for Node.js environment
		'^@storybook/test$': '<rootDir>/__mocks__/endtoend/@storybook/test.js',
	},

	// Setup files for end-to-end tests
	setupFilesAfterEnv: [],

	// Longer timeout for end-to-end tests
	testTimeout: 60000,

	// Transform configuration
	transform: {
		'^.+\\.(ts|tsx)$': [
			'ts-jest',
			{
				useESM: true,
				tsconfig: {
					module: 'esnext',
					target: 'es2020',
				},
			},
		],
	},

	// Transform ignore patterns - include Storybook packages to avoid transformation issues
	transformIgnorePatterns: [
		'/node_modules/(?!(mime|filesize|@formatjs|@hcaptcha|puppeteer)/)',
	],
};

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
	dir: './',
});

// Create the Next.js config but override specific settings for end-to-end tests
module.exports = async () => {
	return await createJestConfig(config)();
};
