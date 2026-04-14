interface CoverAttributes {
  overlayColor?: string;
  url?: string;
  dimRatio?: number;
  minHeight?: number;
  focalPoint?: {
    x: number;
    y: number;
  };
  children: React.ReactNode;
}

interface CoverProps extends HTMLProps<HTMLDivElement>, CoverAttributes {}
