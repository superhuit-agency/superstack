interface QueryTitleAttributes extends BlockAttributes {
  type?: 'archive' | 'search' | 'post-type';
  level?: number;
  levelOptions?: number[];
  showPrefix?: boolean;
  showSearchTerm?: boolean;
  textAlign?: 'left' | 'right' | 'center';
}

interface QueryTitleProps extends QueryTitleAttributes {
  content: string;
}
