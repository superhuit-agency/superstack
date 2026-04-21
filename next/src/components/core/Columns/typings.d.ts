type ColumnsVerticalAlignment = 'top' | 'center' | 'bottom' | 'stretch';
type ColumnsLayoutType = 'constrained' | 'flow' | 'flex' | 'grid';

interface ColumnsAttributes {
  isStackedOnMobile?: boolean;
  verticalAlignment?: ColumnsVerticalAlignment;
  layout?: {
    type?: ColumnsLayoutType;
  };
}

interface ColumnsProps
  extends React.HTMLProps<HTMLDivElement>, ColumnsAttributes {}
