import { gql } from '@/utils';

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

	const data = await fetcher(query);
	const title = data?.generalSettings?.title;

	return {
		content: typeof title === 'string' ? title : '',
	};
};
