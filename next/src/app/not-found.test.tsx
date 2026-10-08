import { afterEach, describe, expect, it, vi } from 'vitest';

import NotFound from './not-found';
import { langContext } from '@/hooks/use-lang';
import {
	enrichTemplateBlocks,
	getNotFoundBreadcrumbs,
	getTemplateBlocks,
} from '@/lib';

vi.mock('@/components/global/Template', () => ({ default: () => null }));

vi.mock('@/hooks/use-lang', () => ({ langContext: vi.fn() }));

vi.mock('@/lib', () => ({
	enrichTemplateBlocks: vi.fn(async (blocks: unknown) => blocks),
	getNotFoundBreadcrumbs: vi.fn(async () => []),
	getTemplateBlocks: vi.fn(async () => []),
	injectBreadcrumbs: vi.fn((blocks: unknown) => blocks),
}));

afterEach(() => {
	vi.clearAllMocks();
});

describe('NotFound', () => {
	it('renders the template and breadcrumbs in the current language', async () => {
		vi.mocked(langContext).mockReturnValue('de' as Locale);
		const blocks = [{ name: 'core/template-part' }];
		vi.mocked(getTemplateBlocks).mockResolvedValueOnce(
			blocks as BlockPropsType[]
		);

		await NotFound();

		expect(vi.mocked(getTemplateBlocks)).toHaveBeenCalledWith('404', 'de');
		expect(vi.mocked(enrichTemplateBlocks)).toHaveBeenCalledWith(blocks, {
			lang: 'de',
		});
		expect(vi.mocked(getNotFoundBreadcrumbs)).toHaveBeenCalledWith('de');
	});

	it('reads the default language without a language set', async () => {
		vi.mocked(langContext).mockReturnValue(null);

		await NotFound();

		expect(vi.mocked(getTemplateBlocks)).toHaveBeenCalledWith('404', null);
		expect(vi.mocked(enrichTemplateBlocks)).toHaveBeenCalledWith([], {
			lang: null,
		});
		expect(vi.mocked(getNotFoundBreadcrumbs)).toHaveBeenCalledWith(null);
	});
});
