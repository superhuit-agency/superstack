import { baseUriContext } from '@/hooks/use-base-uri';
import { gql } from '@/utils';

const archivePrefix = (type: string): string => {
  if (type === 'archive') return 'Archives';
  if (type === 'post-type') return 'Post Type';
  return '';
};

export const getData = async (
  fetcher: FetchApiFuncType,
  attrs: QueryTitleAttributes | null = null,
) => {
  const type = attrs?.type ?? 'archive';
  const showPrefix = attrs?.showPrefix ?? true;
  const showSearchTerm = attrs?.showSearchTerm ?? true;

  const uri = baseUriContext();

  if (type === 'search') {
    let searchTerm;

    if(uri && typeof uri === 'string') {
      const url = new URL(uri);
      searchTerm = url.searchParams.get('s') ?? '';
    }
    
    return {
      content:
        showSearchTerm && searchTerm
          ? `Search results for: "${searchTerm}"`
          : 'Search results',
    };
}

  const query = gql`
    query QueryTitleData($uri: String!) {
      nodeByUri(uri: $uri) {
        __typename
        ... on TermNode {
          name
        }
        ... on ContentType {
          label
        }
        ... on User {
          name
        }
      }
    }
  `;

  const data = await fetcher(query, { variables: { uri } });
  const node = data?.nodeByUri;
  const name: string = typeof node?.label === 'string' ? node.label : typeof node?.name === 'string' ? node.name : '';

  if (!name) return { content: '' };

  if (showPrefix) {
    const prefix = archivePrefix(type);
    return { content: prefix ? `${prefix}: ${name}` : name };
  }

  return { content: name };
};
