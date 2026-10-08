import { cacheLife, cacheTag } from 'next/cache';

import configs from '@/configs.json';
import { gql } from '@/utils';
import { fetchAPI } from '@/lib';
import { cacheTags } from '@/lib/cache-tags';

/**
 * Builds the breadcrumbs trail for the 404 route.
 *
 * A 404 has no node, so there is no `seo.breadcrumbs` trail to read. Yoast
 * still exposes the labels it would render itself (Settings > Breadcrumbs) on
 * the root `seo` field, so we assemble the same two-level trail from those.
 *
 * Cached until the site settings change.
 *
 * @param {string|null} lang - The language code
 *
 * @returns {Promise<Array<{ text: string; url: string }>>}
 */
export default async function getNotFoundBreadcrumbs(
	lang: string | null = null
): Promise<Array<{ text: string; url: string }>> {
	'use cache';
	cacheLife('max');
	cacheTag(cacheTags.settings(), cacheTags.nodes());

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

	const homeUrl = configs.isMultilang && lang ? `/${lang}/` : '/';

	return [
		...(homeText ? [{ text: homeText, url: homeUrl }] : []),
		...(notFoundText ? [{ text: notFoundText, url: '' }] : []),
	];
}
