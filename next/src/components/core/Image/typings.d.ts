interface ImageAttributes {
  url: string;
  caption?: string;
  sizeSlug?: string;
  aspectRatio?: string;
  width?: string;
  height?: string;
  scale?: "cover" | "contain";
}

interface ImageProps
  extends
    Omit<React.HTMLProps<HTMLImageElement>, "width" | "height">,
    ImageAttributes {
  priority?: boolean;
  fill?: boolean;
  quality?: number;
  focalPoint?: FocalPoint;
}
