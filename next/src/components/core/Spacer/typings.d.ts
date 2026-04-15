interface SpacerAttributes extends BlockAttributes {
  height?: number;
  width?: number;
  className?: string;
  style?: {
    layout?: {
      selfStretch?: 'fill' | 'fit' | 'fixed';
      flexSize?: number;
    };
  };
}

interface SpacerProps
  extends React.HTMLProps<HTMLDivElement>, SpacerAttributes {}
