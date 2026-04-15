interface EmbedAttributes {
  url: string;
  providerNameSlug?: string;
  type?: string;
  caption?: string;
}

interface EmbedProps
  extends React.HTMLProps<HTMLFigureElement>, EmbedAttributes {}
