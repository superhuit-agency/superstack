import { gql } from '@/utils';

export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: AvatarAttributes | null = null
) => {
	const query = gql`
		query AvatarData($userId: ID!) {
			user(id: $userId, idType: DATABASE_ID) {
				username
				uri
				avatar {
					url
				}
			}
		}
	`;

	const data = await fetcher(query, {
		variables: {
			userId: attrs?.userId,
		},
	});

	return {
		data: {
			url: data?.user?.avatar?.url,
			alt: data?.user?.username,
		},
	};
};
