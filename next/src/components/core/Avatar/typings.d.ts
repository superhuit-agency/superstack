interface AvatarAttributes extends BlockAttributes {
  isLink?: boolean;
  level?: number;
  linkTarget?: string;
  size?: number;
  userId?: number;
}

interface AvatarProps extends HTMLProps<HTMLDivElement>, AvatarAttributes {
  data: {
    uri: string;
    url: string;
    alt: string;
  };
}
