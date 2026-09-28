import { gql } from '@/utils';
import { taxonomyToGraphqlEnum } from './helper';

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: TaxonomyListAttributes | null = null
) => {
	const taxonomyEnum = taxonomyToGraphqlEnum(attrs?.taxonomy ?? '');

	// A block that has not been configured yet has no taxonomy. Querying
	// `terms` without one is both invalid (an empty `TaxonomyEnum` value) and
	// pointless: the list renders nothing without terms.
	if (!taxonomyEnum) {
		return { data: { terms: { nodes: [] } } };
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
					}
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

	return { data };
};
