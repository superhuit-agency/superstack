import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		include: ['src/**/*.test.{ts,tsx}', 'eslint-rules/**/*.test.ts'],
	},
});
