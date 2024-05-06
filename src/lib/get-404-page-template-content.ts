import { singlePageData } from '@/components/templates/data';
import configs from '@/configs.json';
import { fetchAPI, formatBlocksJSON } from '@/lib';
import { gql } from '@/utils';

export default async function get404PageTemplateContent(language: string) {
	const query = gql`
		query page404Query(
			$isPreview: Boolean = false
			$isPreviewDraft: Boolean = false
		) {
			pages(
				where: { template: { in: "template-404.php" }${
					configs.isMultilang ? `, language: ${language}` : ''
				} }
				first: 1
			) {
				nodes {
					__typename
					...singlePageFragment
				}
			}
		}
		${singlePageData.fragment}
	`;

	const response = await fetchAPI(query);

	const { pages } = response;

	// Bail early as no node was found
	if (!pages || !pages.nodes[0]) return null;

	const node = pages.nodes[0];

	/**
	 * Enrich & format node blocksJSON prop
	 */
	node.blocksJSON = await formatBlocksJSON(node.blocksJSON as string);

	return node;
}
