interface TermQueryType {
  hideEmpty: boolean;
  include: string[];
  inherit: boolean;
  order: 'asc' | 'desc';
  orderBy: 'name' | 'slug' | 'count';
  perPage: number;
  showNested: boolean;
  taxonomy: string;
}

interface TermsQueryAttributes extends BlockAttributes {
  termQuery?: Partial<TermQueryType>;
}

type TermsQueryTermNode = {
  id: string;
  databaseId: number;
  name: string | null;
  slug: string | null;
  uri: string | null;
  count: number | null;
  taxonomyName?: string | null;
};

type TermsQueryProps = TermsQueryAttributes & {
  data: {
    terms: {
      nodes: TermsQueryTermNode[];
    };
  };
  children?: React.ReactNode;
};
