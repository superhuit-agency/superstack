interface WpBlockType<T> {
	slug: string;
	settings: Omit<BlockConfiguration<T>, 'attributes'> &
		Pick<Block<T & { isPreview?: boolean }>, 'attributes'> & {
			postTypes?: PostType[];
			innerBlocksHeadingAvailableLevels?: number[];
		};
}

type PostType = 'page' | 'post' | 'form';

interface WpBlockEditProps<T> extends Omit<BlockEditProps<T>, 'attributes'> {
	name?: string;
	readonly attributes: Readonly<T & { isPreview?: boolean }>;
}

type BlockPropsType = {
	name: string;
	attributes: Record<string, unknown>;
	innerBlocks: Array<any>;
};

type WpFilterType = {
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

type InputProps = Omit<HTMLProps<HTMLInputElement>, 'onChange'> & {
	label: string;
	name: string;
	invalid?: boolean | string;
	inputAttributes?: HTMLAttributes<HTMLInputElement>;
	onChange?: Function;
};

interface ImageProps {
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

type VideoProps = Omit<HTMLProps<HTMLVideoElement>, 'poster'> & {
	id: string;
	caption: string;
	poster?: ImageProps;
	source?: 'youtube' | 'vimeo';
	src?: string;
	url?: string;
};

type BlockConfigs = {
	slug?: string;
	title?: string;
};

type MenuItemType = LinkProps & {
	label: string;
	path: string;
	cssClasses?: cxArgument[];
	items?: MenuItemType[];
};

type LinkProps = React.HTMLProps<HTMLAnchorElement> & {
	scroll?: boolean;
	prefetch?: boolean;
	ref?: Ref<HTMLAnchorElement>;
	// target?: string;
	// download?: boolean;
};

type AuthType = {
	authToken?: string;
};

type FetchApiFuncType = (
	query: string,
	options?: {
		variables?: any;
		auth?: AuthType;
		endpoint?: string;
		headers?: any;
	}
) => Promise<any>;

interface SectionProps extends HTMLProps<HTMLDivElement> {
	anchor?: string;
	uptitle?: string;
	title?: string;
	introduction?: string;
}

type ChildrenProps = {
	children?: React.ReactNode;
};
