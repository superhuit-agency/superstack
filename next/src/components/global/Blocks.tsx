import React from 'react';

type BlockModule = {
  default: React.ElementType;
};

const blocksList: Record<string, () => Promise<BlockModule>> = {
  'core/audio': () => import('../core/Audio'),
  'core/button': () => import('../core/Button'),
  'core/buttons': () => import('../core/Buttons'),
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
  'core/media-text': () => import('../core/MediaText'),
  'core/preformatted': () => import('../core/Preformatted'),
  'core/pullquote': () => import('../core/Pullquote'),
  'core/separator': () => import('../core/Separator'),
  'core/spacer': () => import('../core/Spacer'),
  'core/table': () => import('../core/Table'),
  'core/verse': () => import('../core/Preformatted'),
  'core/video': () => import('../core/Video'),
  'core/social-links': () => import('../core/SocialLinks'),
  'core/social-link': () => import('../core/SocialLink'),
  'core/categories': () => import('../core/TaxonomyList'),
  'core/html': () => import('../core/CustomHtml'),
  'core/latest-posts': () => import('../core/LatestPosts'),
};

interface PostBodyBlocksProps {
  blocks: Array<BlockPropsType>;
  includes?: RegExp;
  excludes?: RegExp;
  isRoot?: boolean;
  level?: number;
}

export async function Blocks({
  blocks,
  includes = /.*/g,
  excludes = /^$/g,
  isRoot = true,
  level = 2,
}: PostBodyBlocksProps) {
  const renderedBlocks = await Promise.all(
    blocks?.map(async ({ name, ...props }, i) => {
      let currentLevel = level;
      if (!!blocksList[name as keyof typeof blocksList]) {
        if (
          new RegExp(includes).test(name) &&
          !new RegExp(excludes).test(name)
        ) {
          const blockComponent =
            await blocksList[name as keyof typeof blocksList]();
          const Block = blockComponent.default;
          // check if section is the first one on the page to define its title Tag (h1 or h2)
          if (isRoot && props.attributes) {
            if (i === 0) currentLevel = level - 1;
          }
          return (
            <Block
              key={i}
              slug={name}
              level={currentLevel}
              {...props.attributes}
            >
              {props.innerBlocks && (
                <Blocks
                  blocks={props.innerBlocks}
                  isRoot={false}
                  level={currentLevel + 1}
                />
              )}
            </Block>
          );
        }
      } else {
        // FALLBACK: means the block is not yet implemented in next.js
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `The following block does not exist: ${name}. This typically happens if you forget to import and render it in blocks.js. See source code for more info & solutions.`,
          );
        }
      }
      return null;
    }),
  );

  return <>{renderedBlocks}</>;
}
