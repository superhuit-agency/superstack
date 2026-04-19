type ColumnsVerticalAlignment = 'top' | 'center' | 'bottom' | 'stretch';
type ColumnsLayoutType = 'constrained' | 'flow' | 'flex' | 'grid';

interface ColumnsAttributes {
  isStackedOnMobile?: boolean;
  verticalAlignment?: ColumnsVerticalAlignment;
  templateLock?: 'all' | 'insert' | 'contentOnly' | false;
  layout?: {
    type?: ColumnsLayoutType;
  };
}

interface ColumnsProps
  extends React.HTMLProps<HTMLDivElement>, ColumnsAttributes {}
