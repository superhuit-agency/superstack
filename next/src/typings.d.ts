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
	/**
	 * Per-language `innerBlocks` overrides for `core/template-part` blocks,
	 * keyed by Polylang language slug (e.g. "de"). Populated by the FSE
	 * templates read (get-fse-templates.ts) from translated template parts
	 * (`<slug>___<lang>`). See getTemplateBlocks in
	 * get-node-by-uri.ts for how these are swapped in at request time.
	 */
	translations?: Record<string, Array<BlockPropsType | null>>;
};

/**
 * The archive being viewed, threaded into `getData(fetcher, attrs, lang, context)`
 * of blocks declaring `usesArchiveContext`. Populated from the resolved node
 * (see get-node-by-uri.ts), and part of their block data's cache key.
 */
type BlockDataContext = {
	/**
	 * The taxonomy term being viewed on a term archive (Tag/Category), so query
	 * loops can scope their posts to the current term.
	 */
	term?: {
		/** WPGraphQL taxonomy handle, e.g. "tag" | "category". */
		taxonomy: string;
		/** The term's WordPress database ID. */
		databaseId: number;
	};
	/**
	 * The post type the archive lists (a ContentType node, or a term archive),
	 * so query loops inheriting the template query resolve the right post type:
	 * WordPress leaves `query.postType` at its default when `query.inherit` is true.
	 */
	archive?: {
		/** The WordPress post type slug, e.g. "post". */
		postType: string;
	};
};

type FseTemplateEntry = {
	slug: string;
	blocks: Array<BlockPropsType | null>;
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
		headers?: Record<string, string>;
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
