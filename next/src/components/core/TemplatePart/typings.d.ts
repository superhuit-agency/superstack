interface TemplatePartAttributes {
  slug: string;
  area?: string;
  tagName?: TagName;
}

interface TemplatePartProps
  extends React.HTMLProps<HTMLDivElement>, TemplatePartAttributes {}
