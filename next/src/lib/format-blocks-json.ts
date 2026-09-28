import { getWpUrl } from '@/utils/node-utils';
import getFunkyWpUploadsURI from '@/lib/get-funky-wp-uploads-uri';
import getBlockFinalComponentProps from '@/lib/get-block-final-component-props';
import { throwIfBaseUriNotDeclared } from '@/hooks/use-base-uri';

export default async function formatBlocksJSON(
	blocksJSON: string,
	options?: {
		skipGetData?: boolean;
		lang?: string | null;
		preview?: boolean;
		context?: BlockDataContext;
	}
) {
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

	if (!blocksJSON) return [];

	const results = await Promise.allSettled(
		JSON.parse(blocksJSON).map((block: any) =>
			getBlockFinalComponentProps(block, options)
		)
	);
	throwIfBaseUriNotDeclared(results);

	return results.map((p: PromiseSettledResult<BlockPropsType>) =>
		p.status === 'fulfilled' ? p.value : null
	);
}
