import { gql } from '@/utils';

import { seoPostTypeFragment } from '@/lib/fragments';

export const fragment = gql`
  fragment singlePageFragment on Page {
    id: databaseId
    title(format: RENDERED)
    blocksJSON
    uri
    isFrontPage
    fseTemplate {
      slug
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
  }
  ${seoPostTypeFragment}
`;

export const slug = 'single-page';
