import React, { FC } from 'react';

// This is not possible anymore due to Server Side components
// import * as allRenders from '../renders';
// const allBlocks: Record<string, BlockType> = allRenders;
// const blocksList: BlockType = {};
// for (const key in allBlocks) {
// 	const blk: BlockType = allBlocks[key];
// 	blocksList[blk.slug] = blk;
// }

export type BlocksType = Record<string, FC<any>>;

interface PostBodyBlocksProps {
	blocksList: BlocksType;
	blocks: Array<BlockPropsType>;
	includes?: RegExp;
	excludes?: RegExp;
	isRoot?: boolean;
	level?: number;
}

export const Blocks: FC<PostBodyBlocksProps> = ({
	blocksList,
	blocks,
	includes = /.*/g,
	excludes = /^$/g,
	isRoot = true,
	level = 2,
}) => {
	let currentLevel = level;

	return (
		<>
			{blocks?.map(({ name, ...props }, i) => {
				if (!!blocksList[name]) {
					if (
						new RegExp(includes).test(name) &&
						!new RegExp(excludes).test(name)
					) {
						const Block = blocksList[name];
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
										blocksList={blocksList}
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
							`The following block does not exist: ${name}. This typically happens if you forget to import and render it in blocks.js. See source code for more info & solutions.`
						);
					}
				}
				return null;
			})}
		</>
	);
};
