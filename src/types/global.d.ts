/**
 * Here are referenced all the global type definitions used across this project.
 * Since this file is referenced from tsconfig.json, All these types and interfaces
 * are available to all the files in the project.
 */
declare global {
	//#region Configs

	type ConfigsType = {
		isMultilang: boolean;
		staticLang: string;
		hasCurrentLocaleInLangSwitcher: boolean;
		dateFormat: string;
	};

	//#endregion

	//#region Get Nodes with GraphQL

	type AppNodeQueryResponse = {
		node: (PageNodeData | MultilingualPageNodeData) & {
			blocksJSON: string;
			preview?: AppNodeQueryResponse;
		};
		seo?: any;
		generalSettings?: any;
	};

	//#endregion

	//#region Page Nodes

	type Language = {
		locale: string;
		code: string;
	};
	type PageNodeLanguage = {
		uri: string;
		language: Language;
	};

	type PostType = 'page' | 'post' | 'form';

	//TODO: Replace any with proper types
	interface ITemplateNode {
		siteSEO: any;
		siteSettings: any;
	}

	/**
	 * Data structure for a page node that we typically retreive from GraphQL
	 */
	type PageSeo = {
		title: string;
		metaDesc: string;
		metaKeywords: string;
		metaRobotsNoindex: string;
		metaRobotsNofollow: string;
		canonical: string;
		opengraphTitle: string;
		opengraphDescription: string;
		opengraphUrl: string;
		opengraphImage: {
			src: string;
		};
		twitterTitle: string;
		twitterDescription: string;
		twitterImage: {
			src: string;
			alt?: string;
		};
		breadcrumbs: {
			text: string;
			url: string;
		};
	};
	//#endregion

	//#region Gutenberg Blocks

	interface WpBlockType<T> {
		slug: string;
		settings: Omit<BlockConfiguration<T>, 'attributes'> &
			Pick<Block<T & { isPreview?: boolean }>, 'attributes'> & {
				postTypes?: PostType[];
				innerBlocksHeadingAvailableLevels?: number[];
			};
	}

	interface WpBlockEditProps<T>
		extends Omit<BlockEditProps<T>, 'attributes'> {
		name?: string;
		readonly attributes: Readonly<T & { isPreview?: boolean }>;
	}

	type RawBlockPropsType = {
		innerBlocks: Array<RawBlockPropsType>;
		name: string;
		postId: number;
		blockType: {
			name: string;
			keywords: Array<string>;
			attributes: BlockAttributesDefinitionType;
			providesContext: Array<string>;
			usesContext: Array<string>;
			selectors: Array<string>;
			supports: {
				anchor?: boolean;
				align?: boolean | array;
				alignWide?: boolean;
				ariaLabel?: boolean;
				background?: {
					backgroundImage?: boolean;
					backgroundSize?: boolean;
				};
				className?: boolean;
				color?: {
					background?: boolean;
					button?: boolean;
					enableContrastChecker?: boolean;
					__experimentalDuotone?: boolean;
					gradients?: boolean;
					heading?: boolean;
					link?: boolean;
					text?: boolean;
				};
				customClassName?: boolean;
				dimensions?: {
					minHeight: boolean;
				};
				filter?: {
					duotone?: boolean;
				};
				html?: boolean;
				inserter?: boolean;
				interactivity?: boolean | object;
				layout?:
					| boolean
					| {
							default?: { type: string };
							allowSwitching?: boolean;
							allowEditing?: boolean;
							allowInheriting?: boolean;
							allowSizingOnChildren?: boolean;
							allowVerticalAlignment?: boolean;
							allowJustification?: boolean;
							allowOrientation?: boolean;
							allowCustomContentAndWideSize?: boolean;
					  };
				lock?: boolean;
				multiple?: boolean;
				position?: {
					sticky?: boolean;
				};
				renaming?: boolean;
				reusable?: boolean;
				shadow?: boolean;
				spacing?: {
					margin: boolean | ['top' | 'right' | 'bottom' | 'left'];
					padding: boolean | ['top' | 'right' | 'bottom' | 'left'];
					blockGap: boolean | ['horizontal' | 'vertical'];
				};
				typography?: {
					fontSize?: boolean;
					lineHeight?: boolean;
					textAlign?:
						| boolean
						| ['left' | 'center' | 'right' | 'justify'];
				};
				splitting?: boolean;
			};
			styles: {
				name: string;
				label: string;
				isDefault: boolean;
			};
			variations: [];
			blockHooks: [];
			title: string;
			description: string;
			postTypes: Array<string>;
			category: string;
			example: {
				name: string;
				attributes: BlockAttributesType;
			};
			parent: [];
		};
		originalContent: string;
		saveContent: string;
		order: number;
		get_parent: {};
		attributes: BlockAttributesType;
		attributesType: BlockAttributesDefinitionType;
		dynamicContent: string;
	};

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
			  ) => (
					props: BlockEditProps<Record<string, unknown>>
			  ) => JSX.Element)
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

	//#endregion
}

export {}; // This is needed to make the file a module
