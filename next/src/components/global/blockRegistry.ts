type BlockModule = {
  default: React.ElementType;
};

const blocksList: Record<string, () => Promise<BlockModule>> = {
  'core/audio': () => import('../core/Audio'),
  'core/cover': () => import('../core/Cover'),
  'core/file': () => import('../core/File'),
  'core/heading': () => import('../core/Heading'),
  'core/paragraph': () => import('../core/Paragraph'),
  'core/image': () => import('../core/Image'),
  'core/gallery': () => import('../core/Gallery'),
  'core/list': () => import('../core/List'),
  'core/list-item': () => import('../core/ListItem'),
  'core/quote': () => import('../core/Quote'),
  'core/code': () => import('../core/Code'),
  'core/details': () => import('../core/Details'),
  'core/math': () => import('../core/Math'),
  'core/preformatted': () => import('../core/Preformatted'),
  'core/pullquote': () => import('../core/Pullquote'),
  'core/table': () => import('../core/Table'),
  'core/verse': () => import('../core/Preformatted'),
  'core/social-links': () => import('../core/SocialLinks'),
  'core/social-link': () => import('../core/SocialLink'),
  'core/categories': () => import('../core/TaxonomyList'),
  'core/html': () => import('../core/CustomHtml'),
  'core/latest-posts': () => import('../core/LatestPosts'),
};

export const blocksDataList = {
  'core/categories': () => import('../core/TaxonomyList/data'),
  'core/latest-posts': () => import('../core/LatestPosts/data'),
  'core/navigation': () => import('../core/Navigation/data'),
  'core/site-logo': () => import('../core/SiteLogo/data'),
};
