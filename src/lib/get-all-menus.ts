import configs from '@/configs.json';
import { fetchAPI, formatMenuItems } from '@/lib';
import { MenuItem, menuItemFragment } from '@/lib/fragments';
import { gql } from '@/utils';

type Menus = MainNavProps & FooterDataType;

/**
 * Dynamic data formatter/parser.
 *
 * @param {unknown}     data      Data from GraphQL query response
 * @param {boolean} 		isEditor  Whether the formatter function is being called within the WP block editor.
 * @returns {}             				The transformed/formatted/parsed data
 */
export const formatter = (props: unknown): Menus => {
	const { generalSettings, siteLogo, ...menus } = props as Record<
		string,
		any
	>;

	// Format the data for the menus
	const newMenus = Object.keys(menus).reduce((acc, location) => {
		return {
			...acc,
			[location]: {
				items: formatMenuItems(
					menus[location as keyof typeof menus]?.nodes as MenuItem[]
				),
			},
		};
	}, {}) as {
		header: { items: MenuItemType[] };
		footer: { items: MenuItemType[] };
		legal: { items: MenuItemType[] };
		social: { items: MenuItemType[] };
	};

	return {
		siteTitle: generalSettings?.title || '',
		logo: {
			src: siteLogo?.src || '',
			width: siteLogo?.mediaDetails.width || 0,
			height: siteLogo?.mediaDetails.height || 0,
		},
		menus: {
			header: newMenus.header || { items: [] },
			footer: newMenus.footer || { items: [] },
			legal: newMenus.legal || { items: [] },
			social: newMenus.social || { items: [] },
		},
	};
};

export const getAllMenus = async () => {
	const locations = ['HEADER', 'FOOTER', 'LEGAL', 'SOCIAL'];
	const lang = configs.staticLang; // TODO :: Handle this from next i18n

	const query = gql`
		query mainNavQuery {
			${locations.map(
				(location: string) => `
				${location.toLowerCase()}: menuItems(where: {${
					configs.isMultilang ? `language: ${lang},` : ''
				} location: ${location}}, first: 9999) {
					nodes {
						...menuItemFragment
					}
				}`
			)}
			siteLogo {
				src: sourceUrl
				mediaDetails {
					height
					width
				}
			}
			generalSettings {
				title
			}
		}
		${menuItemFragment}
	`;

	const data = await fetchAPI(query, {});

	return formatter(data);
};
