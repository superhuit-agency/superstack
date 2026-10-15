import { cacheTags } from '@/lib/cache-tags';
import { gql } from '@/utils';
import type { SiteTitleDataQuery } from '@/__generated__/graphql';

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: SiteTitleAttributes | null = null
) => {
	void attrs;

	const query = gql`
		query SiteTitleData {
			generalSettings {
				title
			}
		}
	`;

	const data = await fetcher<SiteTitleDataQuery>(query);
	const title = data?.generalSettings?.title;

	return {
		content: typeof title === 'string' ? title : '',
		cacheTags: [cacheTags.settings()],
	};
};
