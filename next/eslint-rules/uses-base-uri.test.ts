import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import { noUnusedUsesBaseUri, requireUsesBaseUri } from './uses-base-uri.mjs';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

const importsContext = `import { baseUriContext } from '@/hooks/use-base-uri';`;
const declares = `export const usesBaseUri = true;`;
const getData = `export const getData = async () => ({ content: '' });`;

const validModule = [importsContext, declares, getData].join('\n');
const missingOptIn = [importsContext, getData].join('\n');
const optInWithoutImport = [declares, getData].join('\n');
const neither = getData;

describe('uses-base-uri', () => {
	ruleTester.run('require-uses-base-uri', requireUsesBaseUri, {
		valid: [
			validModule,
			optInWithoutImport,
			neither,
			[
				importsContext,
				'const usesBaseUri = true;',
				'export { usesBaseUri };',
				getData,
			].join('\n'),
			`import { guardBaseUri } from '@/hooks/use-base-uri';\n${getData}`,
		],
		invalid: [
			{
				code: missingOptIn,
				errors: [{ messageId: 'missing' }],
			},
			{
				code: [
					importsContext,
					'export const usesBaseUri = false;',
					getData,
				].join('\n'),
				errors: [{ messageId: 'missing' }],
			},
			{
				code: `import { baseUriContext } from '../../../hooks/use-base-uri';\n${getData}`,
				errors: [{ messageId: 'missing' }],
			},
			{
				code: `import * as baseUri from '@/hooks/use-base-uri';\n${getData}`,
				errors: [{ messageId: 'missing' }],
			},
		],
	});

	ruleTester.run('no-unused-uses-base-uri', noUnusedUsesBaseUri, {
		valid: [validModule, missingOptIn, neither],
		invalid: [
			{
				code: optInWithoutImport,
				errors: [{ messageId: 'unused' }],
			},
		],
	});
});
