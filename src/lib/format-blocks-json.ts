import { getWpUrl } from '@/utils/node-utils';
import { getFunkyWpUploadsURI, getBlockFinalComponentProps } from '@/lib';
import { BlockPropsType } from '@/typings';

export default async function formatBlocksJSON(blocksJSON: string) {
	/**
	 * Replace ocurrences of WP upload URIs with relative url
	 * 'http://whatever/wp-content/uploads/*' becomes '/wp-content/uploads/*'
	 *
	 * Since Next Rewrites act as a proxy (check next.config.js), this way we hide WP address
	 *
	 */
	if (blocksJSON) {
		// Replace funky urls
		const regex = new RegExp(`${getFunkyWpUploadsURI()}`, 'g');
		const subst = '\\/wp-content\\/uploads\\/';
		blocksJSON = blocksJSON.replace(regex, subst);

		// Replace regular urls
		blocksJSON = blocksJSON.replace(
			`${getWpUrl()}/wp-content/uploads/`,
			'/wp-content/uploads/'
		);
	}

	return blocksJSON
		? (
				await Promise.allSettled(
					JSON.parse(blocksJSON).map(getBlockFinalComponentProps)
				)
			).map((p: PromiseSettledResult<BlockPropsType>) =>
				p.status === 'fulfilled' ? p.value : null
			)
		: [];
}
