interface ButtonAttributes {
  variant?: "fill" | "outline" | "link";
  text?: string;
  url?: HTMLAnchorElement["href"];
  linkTarget?: HTMLAnchorElement["target"];
  rel?: HTMLAnchorElement["rel"];
}

interface ButtonProps extends ButtonAttributes, LinkProps {}
