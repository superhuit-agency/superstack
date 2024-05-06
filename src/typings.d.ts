import { ChangeEventHandler, FocusEventHandler, HTMLProps, Ref } from 'react';
import { Argument as cxArgument } from 'classnames';
import { StaticImageData } from 'next/image';
import { Block, BlockConfiguration } from '@wordpress/blocks';
import { BlockEditProps } from '@wordpress/blocks';

export interface WpBlockType<T> {
	slug: string;
	settings: Omit<BlockConfiguration<T>, 'attributes'> &
		Pick<Block<T & { isPreview?: boolean }>, 'attributes'> & {
			postTypes?: PostType[];
			innerBlocksHeadingAvailableLevels?: number[];
		};
}

export type PostType = 'page' | 'post' | 'form';

export interface WpBlockEditProps<T>
	extends Omit<BlockEditProps<T>, 'attributes'> {
	name?: string;
	readonly attributes: Readonly<T & { isPreview?: boolean }>;
}

export type BlockPropsType = {
	name: string;
	attributes: Record<string, unknown>;
	innerBlocks: Array<any>;
};

export type WpFilterType = {
	hook: string;
	namespace: string;
	callback:
		| ((
				Inner: ComponentType<any>
		  ) => (props: BlockEditProps<Record<string, unknown>>) => JSX.Element)
		| ((
				settings: WpBlockType<any>['settings'],
				name: string
		  ) => WpBlockType<any>['settings']);
};

export type InputProps = Omit<HTMLProps<HTMLInputElement>, 'onChange'> & {
	label: string;
	name: string;
	invalid?: boolean | string;
	inputAttributes?: HTMLAttributes<HTMLInputElement>;
	onChange?: Function;
};

export interface ImageProps {
	id?: number;
	src: string | StaticImageData;
	alt: string;
	width: number;
	height: number;
	caption?: string | React.ReactNode;
	className?: string;
	sizes?: string;
	priority?: boolean;
	quality?: number;
	fill?: boolean;
	style?: CSSProperties;
	children?: React.ReactNode;
}

export type VideoProps = Omit<HTMLProps<HTMLVideoElement>, 'poster'> & {
	id: string;
	caption: string;
	poster?: ImageProps;
	source?: 'youtube' | 'vimeo';
	src?: string;
	url?: string;
};

export type BlockConfigs = {
	slug?: string;
	title?: string;
};

export type MenuItemType = LinkProps & {
	label: string;
	path: string;
	cssClasses?: cxArgument[];
	items?: MenuItemType[];
};

export type LinkProps = HTMLProps<HTMLAnchorElement> & {
	scroll?: boolean;
	prefetch?: boolean;
	ref?: Ref<HTMLAnchorElement>;
	// target?: string;
	// download?: boolean;
};

export interface ButtonProps extends LinkProps {
	variant?: 'primary' | 'secondary' | 'link';
}

export interface SectionProps extends HTMLProps<HTMLDivElement> {
	anchor?: string;
	uptitle?: string;
	title?: string;
	introduction?: string;
}

export type ChildrenProps = {
	children?: React.ReactNode;
};
