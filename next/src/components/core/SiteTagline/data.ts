import { gql } from '@/utils';

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

	const data = await fetcher(query);
	const tagline = data?.generalSettings?.description;

	return {
		content: typeof tagline === 'string' ? tagline : '',
	};
};
