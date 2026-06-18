import { gql } from '@/utils';
import { taxonomyToGraphqlEnum } from './helper';

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: TaxonomyListAttributes | null = null
) => {
	const taxonomyEnum = taxonomyToGraphqlEnum(attrs?.taxonomy ?? '');

	const query = gql`
		query TaxonomyListTerms(
			$taxonomies: [TaxonomyEnum!]
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
