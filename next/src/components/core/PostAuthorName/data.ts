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
            }
          }
        }
        ... on Page {
          author {
            node {
              name
              uri
            }
          }
        }
      }
    }
  `;

  const uri = baseUriContext();

  const variables = {
    uri: uri,
  };

  const data = await fetcher(query, { variables });
  const name = data?.nodeByUri?.author?.node?.name;

  return {
    name: name,
    uri: uri,
  };
};
