import { baseUriContext } from '@/hooks/use-base-uri';
import { gql } from '@/utils';

export const getData = async (fetcher: FetchApiFuncType) => {
  const query = gql`
    query nodeByUriQuery($uri: String!) {
      nodeByUri(uri: $uri) {
        ... on Post {
          author {
            node {
              name
              avatar {
                url
              }
            }
          }
        }
        ... on Page {
          author {
            node {
              name
              description
              avatar {
                url
              }
            }
          }
        }
      }
    }
  `;

  const uri = baseUriContext();

  const variables = {
    uri,
  };

  const data = await fetcher(query, { variables });
  const author = data?.nodeByUri?.author;

  return {
    author: author?.node,
  };
};
