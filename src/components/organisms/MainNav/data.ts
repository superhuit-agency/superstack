import { imageData, menuItemData } from '@/components/molecules/data';
import { fetchAPI } from '@/lib';
import { gql } from '@/utils';

import block from './block.json';

// Export block slug for identification
export const slug = block.slug;

export const formatter = (data: GraphQLMainNavFields): MainNavData => ({
	isHome: data.node?.isFrontPage ?? false,
	logo: imageData.formatter(data.logo) ?? null,
	menus: {
		header: {
			items: menuItemData.formatter(data?.header?.nodes ?? []),
		},
	},
	siteTitle: data.generalSettings?.title ?? 'superstack',
});

export const getData = async (uri: string): Promise<MainNavData> => {
	const query = gql`
		query mainNavQuery($uri: String!) {
			header: menuItems(where: { location: HEADER }, first: 9999) {
				nodes {
					...menuItemFragment
				}
			}
			logo: siteLogo {
				...imageFragment
			}
			generalSettings {
				title
				url
			}
			node: nodeByUri(uri: $uri) {
				... on Page {
					isFrontPage
				}
			}
		}
		${imageData.fragment}
		${menuItemData.fragment}
	`;

	const data = await fetchAPI(query, { variables: { uri } });

	return formatter(data);
};
