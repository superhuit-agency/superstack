import { PREVIEW_STATI, fetchAPI } from '@/lib';
import { languageFields } from './fragments';

const POST_TYPES = ['Page', 'Post'];

export default async function getPreviewNode({
	id,
	idType = 'DATABASE_ID',
	auth = undefined,
}: {
	id: string;
	idType: string;
	auth?: { authToken: string };
}) {
	const supportedPreviewIdTypes = ['DATABASE_ID'];
	if (!supportedPreviewIdTypes.includes(idType)) {
		throw new Error(
			`idType '${idType}' is not supported yet. Either implement its support or change it to one of the following: [${supportedPreviewIdTypes.join(
				', '
			)}]`
		);
	}

	const findNode = await fetchAPI(
		`query findNode($id: ID, $idType: ContentNodeIdTypeEnum, $stati: [PostStatusEnum]) {
			node(id: $id, idType: $idType, stati: $stati) {
				__typename
				${POST_TYPES.map(
					(postType) => `...on ${postType} {
					databaseId
					slug
					uri
					status
					${languageFields}
				}`
				).join('\n')}
			}
		}`,
		{
			variables: {
				id,
				stati: PREVIEW_STATI,
				idType: 'DATABASE_ID',
			},
			auth,
		}
	);

	return findNode?.node ?? undefined;
}
