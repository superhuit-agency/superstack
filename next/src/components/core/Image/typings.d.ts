interface ImageAttributes {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
}

interface ImageProps
  extends
    Omit<HTMLProps<HTMLImageElement>, "width" | "height">,
    ImageAttributes {
  priority?: boolean;
  fill?: boolean;
  quality?: number;
}
