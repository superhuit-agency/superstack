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
  };
}

interface GroupProps
  extends React.HTMLProps<HTMLDivElement>, GroupAttributes {}
