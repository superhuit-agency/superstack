import { gql } from '@/utils';

import { translationsFields } from '@/lib/fragments';

export const slug = 'archive';

export const fragment = gql`
  fragment archiveFragment on ContentType {
    name
    graphqlSingleName
    graphqlPluralName
    uri
    fseTemplate {
      slug
    }
    ${translationsFields}
  }
`;
