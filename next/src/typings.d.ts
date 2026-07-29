declare module '@wordpress/compose';
declare module '@wordpress/blocks';
declare module '@wordpress/data';
declare module '@wordpress/components';

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

/**
 * Request-time context threaded into a block's `getData(fetcher, attrs, lang, context)`.
 * Populated per request from the resolved node (see get-node-by-uri.ts) so blocks
 * like `core/query` can resolve pagination without a rebuild.
 */
type BlockDataContext = {
	/** Current query-loop page from the `/page/{n}` route (1-based). */
	page?: number;
	/** Base uri of the resolved node (e.g. "/blog/"), used to build page links. */
	baseUri?: string;
	/** The block's own `innerBlocks`, so `getData` can enrich/override children. */
	innerBlocks?: Array<BlockPropsType>;
	/**
	 * The taxonomy term being viewed on a term archive (Tag/Category), so query
	 * loops can scope their posts to the current term without a rebuild.
	 */
	term?: {
		/** WPGraphQL taxonomy handle, e.g. "tag" | "category". */
		taxonomy: string;
		/** The term's WordPress database ID. */
		databaseId: number;
	};
};

type FseTemplateEntry = {
	slug: string;
	blocks: Array<BlockPropsType | null>;
};

type FseTemplatesData = {
	generatedAt: string;
	templates: Array<FseTemplateEntry>;
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

type LinkProps = Omit<React.HTMLProps<HTMLAnchorElement>> & {
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

type FocalPoint = {
	x: number;
	y: number;
};

type TagName =
	| 'div'
	| 'main'
	| 'section'
	| 'article'
	| 'aside'
	| 'header'
	| 'footer';
