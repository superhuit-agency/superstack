import { describe, expect, it, vi } from 'vitest';

import getPreviewNode from '@/lib/get-preview-node';
import { WordPressReadError } from '@/lib/wordpress-read-error';

const fetchAPI = vi.hoisted(() => vi.fn());

vi.mock('@/lib', () => ({ PREVIEW_STATI: ['PUBLISH'], fetchAPI }));

describe('getPreviewNode', () => {
	it('returns the node WordPress found', async () => {
		fetchAPI.mockResolvedValueOnce({ node: { databaseId: 42 } });

		await expect(
			getPreviewNode({ id: '42', idType: 'DATABASE_ID' })
		).resolves.toEqual({ databaseId: 42 });
	});

	it('returns no node when the read fails', async () => {
		fetchAPI.mockRejectedValueOnce(
			new WordPressReadError('the "findNode" query', 'findNode')
		);

		await expect(
			getPreviewNode({ id: '42', idType: 'DATABASE_ID' })
		).resolves.toBeUndefined();
	});
});
