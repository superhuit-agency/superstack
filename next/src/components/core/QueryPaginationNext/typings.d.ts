interface QueryPaginationNextAttributes extends BlockAttributes {
  children?: React.ReactNode;
  label?: string;
  href?: string | null;
  isDisabled?: boolean;
}

type QueryPaginationNextProps = QueryPaginationNextAttributes;
