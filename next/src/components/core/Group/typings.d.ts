type GroupTagName =
  | 'div'
  | 'section'
  | 'header'
  | 'main'
  | 'footer'
  | 'article'
  | 'aside';

type GroupLayoutType = 'constrained' | 'flow' | 'flex' | 'grid';

interface GroupAttributes extends BlockAttributes {
  tagName?: GroupTagName;
  templateLock?: 'all' | 'insert' | 'contentOnly' | false;
  layout?: {
    type?: GroupLayoutType;
    orientation?: 'horizontal' | 'vertical';
    flexWrap?: 'nowrap' | 'wrap';
  };
}

interface GroupProps
  extends React.HTMLProps<HTMLDivElement>, GroupAttributes {}
