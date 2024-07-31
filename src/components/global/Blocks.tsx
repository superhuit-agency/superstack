import React, { FC } from 'react';

import {
	Button,
	Checkbox,
	Form,
	FormSectionBreaker,
	Heading,
	Image,
	InputCheckbox,
	InputEmail,
	InputFile,
	InputRadio,
	InputSelect,
	InputText,
	InputTextarea,
	List,
	ListItem,
	Media,
	Paragraph,
	Radio,
	SectionNews,
	Video,
	Link,
// -- GENERATOR IMPORT SLOT --
} from '..';

const blocksList: BlocksType = {
	'core/heading': Heading,
	'core/list': List,
	'core/list-item': ListItem,
	'core/paragraph': Paragraph,

	'supt/button': Button,

	'supt/checkbox': Checkbox,
	'supt/form': Form,
	'supt/form-section-breaker': FormSectionBreaker,
	'supt/image': Image,
	'supt/input-checkbox': InputCheckbox,
	'supt/input-email': InputEmail,
	'supt/input-file': InputFile,
	'supt/input-radio': InputRadio,
	'supt/input-select': InputSelect,
	'supt/input-text': InputText,
	'supt/input-textarea': InputTextarea,
	'supt/media': Media,
	'supt/radio': Radio,
	'supt/section-news': SectionNews,
	'supt/video': Video,
	'supt/link': Link,
		// -- GENERATOR BLOCK SLOT --
};

type BlocksType = Record<string, FC<any>>;

// This is not possible anymore due to Server Side components
// import * as allRenders from '../renders';
// const allBlocks: Record<string, BlockType> = allRenders;
// const blocksList: BlockType = {};
// for (const key in allBlocks) {
// 	const blk: BlockType = allBlocks[key];
// 	blocksList[blk.slug] = blk;
// }

interface PostBodyBlocksProps {
	blocks: Array<BlockPropsType>;
	includes?: RegExp;
	excludes?: RegExp;
	isRoot?: boolean;
	level?: number;
}

export const Blocks: FC<PostBodyBlocksProps> = ({
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
