import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

import { noUnusedUsesBaseUri, requireUsesBaseUri } from './uses-base-uri.mjs';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester();

const importsContext = `import { baseUriContext } from '@/hooks/use-base-uri';`;
const optIn = `export const usesBaseUri = true;`;
const optInByAttributes = `export const usesBaseUri = (attrs) => attrs.query?.inherit === true;`;
const getData = `export const getData = async () => ({ content: '' });`;

const validModule = [importsContext, optIn, getData].join('\n');
const missingOptIn = [importsContext, getData].join('\n');
const optInWithoutImport = [optIn, getData].join('\n');
const neitherImportsNorOptsIn = getData;

describe('uses-base-uri', () => {
	ruleTester.run('require-uses-base-uri', requireUsesBaseUri, {
		valid: [
			validModule,
			optInWithoutImport,
			neitherImportsNorOptsIn,
			`import { guardBaseUri } from '@/hooks/use-base-uri';\n${getData}`,
			[importsContext, optInByAttributes, getData].join('\n'),
			[
				importsContext,
				'export const usesBaseUri = function (attrs) { return attrs.inherit; };',
				getData,
			].join('\n'),
			[
				importsContext,
				'export function usesBaseUri(attrs) { return attrs.inherit; }',
				getData,
			].join('\n'),
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
		valid: [validModule, missingOptIn, neitherImportsNorOptsIn],
		invalid: [
			{
				code: optInWithoutImport,
				errors: [{ messageId: 'unused' }],
			},
			{
				code: [optInByAttributes, getData].join('\n'),
				errors: [{ messageId: 'unused' }],
			},
		],
	});
});
