interface LatestPostAttributes extends BlockAttributes {
  addLinkToFeaturedImage: boolean;
  categories?: Array<{ id: number }> | string;
  columns: number;
  displayAuthor: boolean;
  displayFeaturedImage: boolean;
  displayPostContent: boolean;
  displayPostContentRadio: string;
  displayPostDate: boolean;
  excerptLength: number;
  featuredImageSizeSlug: string;
  level: number;
  order: string;
  orderBy: string;
  postLayout: string;
  postsToShow: number;
  selectedAuthor?: number;
}

interface LatestPostNode {
  id: string;
  databaseId: number;
  uri: string;
  date?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  author?: {
    node?: {
      name?: string;
    } | null;
  } | null;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
      mediaDetails?: {
        width?: number;
        height?: number;
      } | null;
    } | null;
  } | null;
}

interface LatestPostProps extends LatestPostAttributes {
  data?: {
    posts?: {
      nodes?: LatestPostNode[];
    };
  };
}
