import { addFilter } from '@wordpress/hooks';
import { createElement } from '@wordpress/element';
import { unregisterBlockStyle } from '@wordpress/blocks';
import domReady from '@wordpress/dom-ready';

type BlockListBlockProps = {
  block: {
    name: string;
    attributes: Record<string, unknown> & {
      layout?: {
        type?: string;
        columnCount?: number;
      };
    };
  };
  wrapperProps?: {
    className?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

domReady(() => {
  const parentSectionStyles = [
    'section-1',
    'section-2',
    'section-3',
    'section-4',
    'section-5',
  ];
  const targetBlocks = ['core/group', 'core/columns', 'core/column'];

  targetBlocks.forEach((block) => {
    parentSectionStyles.forEach((style) => {
      unregisterBlockStyle(block, style);
    });
  });
});

addFilter(
  'editor.BlockListBlock',
  'superstack/core-group-grid-columns',
  (BlockListBlock: React.ComponentType<BlockListBlockProps>) =>
    (props: BlockListBlockProps) => {
      if ('core/group' !== props.block.name) {
        return createElement(BlockListBlock, props);
      }

      const layout = props.block.attributes?.layout;

      if ('grid' !== layout?.type || !layout?.columnCount) {
        return createElement(BlockListBlock, props);
      }

      const columnClass = `has-${layout.columnCount}-columns`;
      const existingClassName = props.wrapperProps?.className || '';

      return createElement(BlockListBlock, {
        ...props,
        wrapperProps: {
          ...props.wrapperProps,
          className: `${existingClassName} ${columnClass}`.trim(),
        },
      });
    },
);
