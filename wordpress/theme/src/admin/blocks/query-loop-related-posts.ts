import { registerBlockVariation } from '@wordpress/blocks';

const MY_VARIATION_NAME = 'superstack/related-posts-by-category';

registerBlockVariation('core/query', {
  name: MY_VARIATION_NAME,
  title: 'Articles liés par catégorie',
  description:
    "Afficher des articles de la même catégorie que l'article actuel.",
  keywords: ['related', 'category', 'articles liés', 'catégorie'],
  isActive: ({ namespace }) => {
    return namespace === MY_VARIATION_NAME;
  },
  attributes: {
    namespace: MY_VARIATION_NAME,
    query: {
      postType: 'post',
      perPage: 3,
      pages: 0,
      offset: 0,
      order: 'desc',
      orderBy: 'date',
      sticky: 'ignore',
      inherit: false,
    },
  },
  scope: [],
  allowedControls: [],
  innerBlocks: [
    [
      'core/post-template',
      [['core/pattern', { slug: 'superstack/card-post' }]],
    ],
  ],
});
