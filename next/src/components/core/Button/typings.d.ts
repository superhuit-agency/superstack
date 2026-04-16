interface ButtonAttributes {
  variant?: "fill" | "outline" | "link";
  text?: string;
  url?: HTMLAnchorElement["href"];
  linkTarget?: HTMLAnchorElement["target"];
  rel?: HTMLAnchorElement["rel"];
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  width?: number;
}

interface ButtonProps extends ButtonAttributes, LinkProps {}
