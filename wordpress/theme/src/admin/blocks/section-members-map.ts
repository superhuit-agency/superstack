import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { createElement } from '@wordpress/element';

declare global {
  interface Window {
    superstackSectionMembersMap: {
      mapImageSrc: string;
    };
  }
}

const ALLOWED_BLOCKS = ['core/group', 'core/heading', 'core/paragraph'];

const TEMPLATE = [
  [
    'core/group',
    {
      layout: {
        type: 'flex',
        orientation: 'vertical',
      },
      className: 'spck-section-members-map__content',
    },
    [
      [
        'core/heading',
        {
          content: 'Nos membres',
        },
      ],
      [
        'core/paragraph',
        {
          content:
            'Cliquez sur la carte et découvrez les organisations qui sont membres de notre association. ',
          fontSize: 'x-large',
        },
      ],
    ],
  ],
  [
    'core/paragraph',
    {
      content:
        "Envie de collaborer avec la Superstack ? <a href='/devenir-membre/'>Devenir membre</a>",
      className: 'spck-section-members-map__infos',
    },
  ],
];

registerBlockType('superstack/section-members-map', {
  edit: () => {
    const blockProps = useBlockProps({ className: 'spck-section-members-map' });

    return createElement(
      'section',
      blockProps,
      createElement(
        'div',
        {
          className: 'spck-section-members-map__inner',
        },
        createElement(InnerBlocks, {
          allowedBlocks: ALLOWED_BLOCKS,
          template: TEMPLATE,
          templateLock: 'all',
        }),
        createElement(
          'div',
          {
            className: 'spck-section-members-map__map',
          },
          createElement('img', {
            className: 'spck-section-members-map__map-image',
            src: window.superstackSectionMembersMap.mapImageSrc,
            alt: '',
          }),
        ),
      ),
    );
  },
  save: () => {
    return createElement(InnerBlocks.Content);
  },
});
