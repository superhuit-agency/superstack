import configs from '@/configs.json';
import { cacheTags, termTags } from '@/lib/cache-tags';
import { gql } from '@/utils';
import { taxonomyToGraphqlEnum } from './helper';

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: TaxonomyListAttributes | null = null,
	lang: string | null = null
) => {
	const taxonomy = attrs?.taxonomy ?? '';
	const taxonomyEnum = taxonomyToGraphqlEnum(taxonomy);

	// A block that has not been configured yet has no taxonomy. Querying
	// `terms` without one is both invalid (an empty `TaxonomyEnum` value) and
	// pointless: the list renders nothing without terms.
	if (!taxonomyEnum) {
		return { data: { terms: { nodes: [] } }, cacheTags: [] };
	}

	const query = gql`
		query TaxonomyListTerms(
			$taxonomies: [TaxonomyEnum!]!
			$hideEmpty: Boolean!
		) {
			terms(
				first: 100
				where: { taxonomies: $taxonomies, hideEmpty: $hideEmpty }
			) {
				nodes {
					id
					databaseId
					name
					slug
					uri
					count
					... on Category {
						parent {
							node {
								id
								databaseId
							}
						}
						${configs.isMultilang ? 'language { slug }' : ''}
					}
					${configs.isMultilang ? '... on Tag { language { slug } }' : ''}
				}
			}
		}
	`;

	const options = {
		variables: {
			taxonomies: [taxonomyEnum],
			hideEmpty: !attrs?.showEmpty,
		},
	};

	const data = await fetcher(query, options);

	// The generic `terms` connection has no `language` where-arg (Polylang only
	// adds it to post connections), so terms are filtered on the fetched result.
	// Terms without an assigned language (empty slug) are kept: Polylang treats
	// them as belonging to every language.
	const termNodes: TaxonomyTerm[] = data?.terms?.nodes ?? [];
	const terms =
		configs.isMultilang && lang
			? termNodes.filter(
					(term) =>
						!term.language?.slug ||
						term.language.slug.toLowerCase() === lang.toLowerCase()
				)
			: termNodes;

	return {
		data: { terms: { nodes: terms } },
		cacheTags: [
			...(taxonomy ? [cacheTags.taxonomy(taxonomy)] : []),
			...termTags(terms),
			...(!attrs?.showEmpty || attrs?.showPostCounts
				? [cacheTags.content()]
				: []),
		],
	};
};
