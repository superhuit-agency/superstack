import { registerBlockVariation } from '@wordpress/blocks';

const MY_VARIATION_NAME = 'superstack/latest-posts';

registerBlockVariation('core/query', {
  name: MY_VARIATION_NAME,
  title: 'À la une',
  description: 'Afficher une section avec les derniers articles et événements.',
  keywords: ['actualité', 'événement', 'à la une'],
  isActive: ({ namespace }) => {
    return namespace === MY_VARIATION_NAME;
  },
  attributes: {
    namespace: MY_VARIATION_NAME,
    query: {
      postType: 'post',
      perPage: 4,
      pages: 0,
      offset: 0,
      order: 'desc',
      orderBy: 'date',
      sticky: '',
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
