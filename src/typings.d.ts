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

/**
 * Generic Block Attrs & Props
 */
interface BlockAttributes {
	anchor?: string;
	className?: string;
	isPreview?: boolean;
}

interface BlockProps extends React.HTMLProps<HTMLDivElement> {
	level?: number;
	slug?: string;
}

/**
 * Generic Section Props
 */
interface SectionAttributes extends BlockAttributes {
	introduction?: string;
	title?: string;
	uptitle?: string;
}

interface SectionProps extends SectionAttributes, BlockProps {}

type NextLayoutParams = {
	uri: string[];
	lang: Locale;
};
