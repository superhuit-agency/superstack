import { gql } from '@/utils';

import { languageFields, translationsFields } from '@/lib/fragments';

export const slug = 'category';

export const fragment = gql`
	fragment categoryFragment on Category {
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
