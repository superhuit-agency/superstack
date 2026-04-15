interface ImageAttributes {
  url: string;
  caption?: string;
  sizeSlug?: string;
}

interface ImageProps
  extends React.HTMLProps<HTMLImageElement>, ImageAttributes {
  priority?: boolean;
  fill?: boolean;
  quality?: number;
  focalPoint?: FocalPoint;
}
