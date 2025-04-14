import { menuItemData } from '@/components/molecules/data';
import { fetchAPI } from '@/lib';
import { gql } from '@/utils';
import configs from '@/configs.json';

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
});

export const getData = async ({language}: {language: Locale}): Promise<FooterData> => {
	const query = gql`
		query footerQuery {
			footer: menuItems(
				where: {
					location: FOOTER
					${configs.isMultilang ? `, language: ${language.toUpperCase()}` : ''}
				}
				first: 9999
			) {
				nodes {
					...menuItemFragment
				}
			}
			legal: menuItems(
				where: {
					location: LEGAL
					${configs.isMultilang ? `, language: ${language.toUpperCase()}` : ''}
				}
				first: 9999
			) {
				nodes {
					...menuItemFragment
				}
			}
			social: menuItems(
				where: {
					location: SOCIAL
					${configs.isMultilang ? `, language: ${language.toUpperCase()}` : ''}
				}
				first: 9999
			) {
				nodes {
					...menuItemFragment
				}
			}
			generalSettings {
				title
			}
		}
		${menuItemData.fragment}
	`;

	const data = await fetchAPI(query);

	return formatter(data);
};
