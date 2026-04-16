type ColumnsVerticalAlignment = 'top' | 'center' | 'bottom' | 'stretch';

interface ColumnsAttributes {
  isStackedOnMobile?: boolean;
  verticalAlignment?: ColumnsVerticalAlignment;
}

interface ColumnsProps
  extends React.HTMLProps<HTMLDivElement>, ColumnsAttributes {}
