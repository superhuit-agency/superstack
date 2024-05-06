import { gql } from '@/utils';

import {
	languageFields,
	translationsFields,
	seoPostTypeFragment,
} from '@/lib/fragments';

export const fragment = gql`
	fragment singlePageFragment on Page {
		id: databaseId
		title(format: RENDERED)
		blocksJSON
		uri
		isFrontPage
		archivePage {
			type
			baseUri
			perPage
		}
		editLink @include(if: $isPreview)
		preview @include(if: $isPreviewDraft) {
			node {
				blocksJSON
			}
		}
		seo {
			...seoPostTypeFragment
		}
		${languageFields}
		${translationsFields}
	}
	${seoPostTypeFragment}
`;

export const slug = 'single-page';
