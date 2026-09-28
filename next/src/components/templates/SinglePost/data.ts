import {
	seoPostTypeFragment,
	languageFields,
	translationsFields,
} from '@/lib/fragments';
import { gql } from '@/utils';

export const slug = 'single-post';

export const fragment = gql`
	fragment singlePostFragment on Post {
		id: databaseId
		title(format: RENDERED)
		date
		blocksJSON
		uri

    fseTemplate {
      slug
    }

    featuredImage {
      node {
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }

		categories(first: 1, where: { exclude: [1] }) {
			nodes {
				id: databaseId
				databaseId
				name
				uri
			}
		}
		tags {
			nodes {
				id: databaseId
				databaseId
				name
				uri
			}
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
