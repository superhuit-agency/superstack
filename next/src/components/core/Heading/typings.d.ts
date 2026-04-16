interface HeadingAttributes extends BlockAttributes {
  content: string;
  level?: number;
  textAlign?: 'left' | 'right' | 'center';
}

interface HeadingProps extends HeadingAttributes {}
