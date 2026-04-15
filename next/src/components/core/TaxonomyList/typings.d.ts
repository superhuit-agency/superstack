interface TaxonomyListAttributes extends BlockAttributes {
  displayAsDropdown: boolean;
  level: number;
  label?: string;
  showEmpty: boolean;
  showHierarchy: boolean;
  showLabel: boolean;
  showOnlyTopLevel: boolean;
  showPostCounts: boolean;
  taxonomy: string;
  children?: React.ReactNode;
}

interface TaxonomyListProps extends TaxonomyListAttributes {
  data: {
    terms: {
      nodes: TaxonomyTerm[];
    };
  };
}

type TaxonomyTerm = {
  id: string;
  databaseId?: number;
  name: string;
  slug: string;
  uri?: string;
  count?: number;
  parent?: {
    node?: {
      id?: string;
      databaseId?: number;
    } | null;
  } | null;
};
