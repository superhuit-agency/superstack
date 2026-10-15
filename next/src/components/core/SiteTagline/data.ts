import { cacheTags } from '@/lib/cache-tags';
import { gql } from '@/utils';
import type { SiteTaglineDataQuery } from '@/__generated__/graphql';

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: SiteTaglineAttributes | null = null
) => {
	void attrs;

	const query = gql`
		query SiteTaglineData {
			generalSettings {
				description
			}
		}
	`;

	const data = await fetcher<SiteTaglineDataQuery>(query);
	const tagline = data?.generalSettings?.description;

	return {
		content: typeof tagline === 'string' ? tagline : '',
		cacheTags: [cacheTags.settings()],
	};
};
