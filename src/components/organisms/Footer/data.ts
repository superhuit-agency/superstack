import { menuItemData } from '@/components/molecules/data';
import { fetchAPI } from '@/lib';
import { gql } from '@/utils';

import block from './block.json';

// Export block slug for identification
export const slug = block.slug;

export const formatter = (data: GraphQLFooterFields): FooterData => ({
	menus: {
		footer: { items: menuItemData.formatter(data.footer?.nodes ?? []) },
		legal: { items: menuItemData.formatter(data.legal?.nodes ?? []) },
		social: { items: menuItemData.formatter(data.social?.nodes ?? []) },
	},
	siteTitle: data.generalSettings?.title ?? 'Superstack',
	isHome: data.node?.isFrontPage ?? false,
});

export const getData = async (uri: string): Promise<FooterData> => {
	const query = gql`
		query footerQuery($uri: String!) {
			footer: menuItems(where: { location: FOOTER }, first: 9999) {
				nodes {
					...menuItemFragment
				}
			}
			legal: menuItems(where: { location: LEGAL }, first: 9999) {
				nodes {
					...menuItemFragment
				}
			}
			social: menuItems(where: { location: SOCIAL }, first: 9999) {
				nodes {
					...menuItemFragment
				}
			}
			generalSettings {
				title
			}
			node: nodeByUri(uri: $uri) {
				... on Page {
					isFrontPage
				}
			}
		}
		${menuItemData.fragment}
	`;

	const data = await fetchAPI(query, { variables: { uri } });

	return formatter(data);
};
