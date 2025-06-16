// Mock for @storybook/test to avoid browser dependencies in Node.js environment
// This provides Jest-compatible implementations for end-to-end tests

module.exports = {
	// Use Jest's expect which works in Node.js
	expect: global.expect || require('@jest/globals').expect,

	// Mock other Storybook test utilities
	within: (element) => ({
		getByText: jest.fn(),
		getByRole: jest.fn(),
		queryByText: jest.fn(),
		queryByRole: jest.fn(),
	}),

	userEvent: {
		click: jest.fn(),
		type: jest.fn(),
		clear: jest.fn(),
		setup: jest.fn(() => ({
			click: jest.fn(),
			type: jest.fn(),
			clear: jest.fn(),
		})),
	},

	waitFor: jest.fn(async (callback) => {
		if (typeof callback === 'function') {
			return await callback();
		}
		return Promise.resolve();
	}),

	screen: {
		getByText: jest.fn(),
		getByRole: jest.fn(),
		queryByText: jest.fn(),
		queryByRole: jest.fn(),
		findByText: jest.fn(),
		findByRole: jest.fn(),
	},

	fireEvent: {
		click: jest.fn(),
		change: jest.fn(),
		submit: jest.fn(),
	},

	// Add other commonly used testing utilities
	fn: jest.fn,
	spyOn: jest.spyOn,
};
