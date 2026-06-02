type GroupTagName =
  | 'div'
  | 'section'
  | 'header'
  | 'main'
  | 'footer'
  | 'article'
  | 'aside';

type GroupLayoutType = 'constrained' | 'flow' | 'flex' | 'grid';

interface GroupAttributes {
  tagName?: GroupTagName;
  layout?: {
    type?: GroupLayoutType;
    orientation?: 'horizontal' | 'vertical';
    flexWrap?: 'nowrap' | 'wrap';
    justifyContent?: 'left' | 'center' | 'right' | 'space-between' | 'stretch';
    columnCount?: number;
    minimumColumnWidth?: string;
  };
}

interface GroupProps
  extends React.HTMLProps<HTMLDivElement>, GroupAttributes {}
