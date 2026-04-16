interface SpacerLayoutStyle {
  layout?: {
    selfStretch?: "fill" | "fit" | "fixed";
    flexSize?: number;
  };
};

type SpacerStyle = React.CSSProperties & SpacerLayoutStyle;

interface SpacerAttributes extends BlockAttributes {
  height?: number;
  width?: number;
  className?: string;
  style?: SpacerStyle;
}

interface SpacerProps
  extends Omit<React.HTMLProps<HTMLDivElement>, "style">, SpacerAttributes {}
