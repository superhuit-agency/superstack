type ColumnVerticalAlignment = 'top' | 'center' | 'bottom' | 'stretch';

interface ColumnAttributes {
  verticalAlignment?: ColumnVerticalAlignment;
  width?: string;
}

interface ColumnProps
  extends React.HTMLProps<HTMLDivElement>, ColumnAttributes {}
