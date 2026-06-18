import { gql } from "@/utils";

export const slug = "archive";

export const fragment = gql`
  fragment archiveFragment on ContentType {
    name
    graphqlSingleName
    graphqlPluralName
    uri
    fseTemplate {
      slug
    }
  }
`;
