type QueryType = {
  author?: string;
  exclude?: string[];
  format?: string[];
  inherit?: boolean;
  offset?: number;
  order?: 'asc' | 'desc';
  orderBy?: string;
  pages?: number;
  parents?: number[] | string[];
  perPage?: number;
  postType?: string;
  search?: string;
  sticky?: boolean | string;
};

interface QueryAttributes extends BlockAttributes {
  children: React.ReactNode;
  enhancedPagination: boolean;
  level?: number;
  query?: QueryType;
  queryId?: number;
  slug?: string;
  tagName?: string;
}

interface QueryProps extends QueryAttributes {
  data: {
    posts: {
      nodes: {
        id: string;
        databaseId: number;
        uri: string;
        date: string;
        title: string;
        content: string | null;
        author: {
          node: {
            name: string;
          };
        };
        featuredImage: {
          node: {
            sourceUrl: string;
            altText: string;
            mediaDetails: {
              width: number;
              height: number;
            };
          };
        } | null;
        excerpt: string;
      }[];
    };
  };
}
