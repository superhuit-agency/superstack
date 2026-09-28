import { gql } from '@/utils';
import { fetchAPI } from '@/lib';

/**
 * Builds the breadcrumbs trail for the 404 route.
 *
 * A 404 has no node, so there is no `seo.breadcrumbs` trail to read. Yoast
 * still exposes the labels it would render itself (Settings > Breadcrumbs) on
 * the root `seo` field, so we assemble the same two-level trail from those.
 *
 * @returns {Promise<Array<{ text: string; url: string }>>}
 */
export default async function getNotFoundBreadcrumbs(): Promise<
	Array<{ text: string; url: string }>
> {
	const data = await fetchAPI(gql`
		query notFoundBreadcrumbs {
			seo {
				breadcrumbs {
					enabled
					homeText
					notFoundText
				}
			}
		}
	`);

	const { enabled, homeText, notFoundText } = data?.seo?.breadcrumbs ?? {};

	if (!enabled) return [];

	return [
		...(homeText ? [{ text: homeText, url: '/' }] : []),
		...(notFoundText ? [{ text: notFoundText, url: '' }] : []),
	];
}
