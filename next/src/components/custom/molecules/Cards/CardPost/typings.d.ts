interface CardPostProps {
  featuredimage: ImageAttributes | null;
  title: string;
  excerpt: string | null;
  link: string;
  date: string | null;
  author: {
    name: string;
  } | null;
}
