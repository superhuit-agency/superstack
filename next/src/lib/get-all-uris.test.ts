import { describe, expect, it, vi } from 'vitest';

import getAllURIs from '@/lib/get-all-uris';
import { WordPressReadError } from '@/lib/wordpress-read-error';

const fetchAPI = vi.hoisted(() => vi.fn());

vi.mock('@/lib', () => ({ fetchAPI }));

describe('getAllURIs', () => {
	it('skips the posts and pages when their count fails, not the build', async () => {
		fetchAPI.mockImplementation(async (query: string) => {
			if (query.includes('nodeCounts')) {
				throw new WordPressReadError(
					'the "nodeCounts" query',
					'nodeCounts'
				);
			}
			return { contentTypes: { nodes: [{ uri: '/blog/' }] } };
		});

		await expect(getAllURIs()).resolves.toEqual([{ uri: ['blog'] }]);
	});
});
