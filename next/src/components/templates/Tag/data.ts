import { gql } from '@/utils';

import { languageFields, translationsFields } from '@/lib/fragments';

export const slug = 'tag';

export const fragment = gql`
	fragment tagFragment on Tag {
		id: databaseId
		title: name
		uri
		fseTemplate {
			slug
		}
		${languageFields}
		${translationsFields}
	}
`;
