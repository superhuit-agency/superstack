import { imageData, menuItemData } from '@/components/molecules/data';
import { fetchAPI } from '@/lib';
import { gql } from '@/utils';
import configs from '@/configs.json';

import block from './block.json';

// Export block slug for identification
export const slug = block.slug;

export const formatter = (data: GraphQLMainNavFields): MainNavData => ({
	logo: imageData.formatter(data.logo) ?? null,
	menus: {
		header: {
			items: menuItemData.formatter(data?.header?.nodes ?? []),
		},
	},
	siteTitle: data.generalSettings?.title ?? 'superstack',
});

export const getData = async ({language}: {language: Locale}): Promise<MainNavData> => {
	const query = gql`
		query mainNavQuery {
			header: menuItems(
				where: {
					location: HEADER
					${configs.isMultilang ? `, language: ${language.toUpperCase()}` : ''}
				}
				first: 9999
			) {
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
		}
		${imageData.fragment}
		${menuItemData.fragment}
	`;

	const data = await fetchAPI(query);

	return formatter(data);
};
