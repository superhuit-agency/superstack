/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** Available content entity types that can be queried or filtered. Identifies the primary content structures available in the system. */
export type ContentTypeEnum =
  /** The Type of Content object */
  | 'ATTACHMENT'
  /** The Type of Content object */
  | 'PAGE'
  /** The Type of Content object */
  | 'POST'
  /** The Type of Content object */
  | 'WGG_PREVIEW'
  /** The Type of Content object */
  | 'WP_BLOCK'
  /** The Type of Content object */
  | 'WP_NAVIGATION'
  /** The Type of Content object */
  | 'WP_TEMPLATE'
  /** The Type of Content object */
  | 'WP_TEMPLATE_PART';

/** Date values */
export type DateInput = {
  /** Day of the month (from 1 to 31) */
  day?: number | null | undefined;
  /** Month number (from 1 to 12) */
  month?: number | null | undefined;
  /** 4 digit year (e.g. 2017) */
  year?: number | null | undefined;
};

/** Sort direction for ordered results. Determines whether items are returned in ascending or descending order. */
export type OrderEnum =
  /** Results ordered from lowest to highest values (i.e. A-Z, oldest-newest) */
  | 'ASC'
  /** Results ordered from highest to lowest values (i.e. Z-A, newest-oldest) */
  | 'DESC';

/** Content sorting attributes for post-type objects. Identifies which content property should be used to determine result order. */
export type PostObjectsConnectionOrderbyEnum =
  /** Ordering by content author (typically by author name). */
  | 'AUTHOR'
  /** Ordering by popularity based on number of comments. */
  | 'COMMENT_COUNT'
  /** Chronological ordering by publication date. */
  | 'DATE'
  /** Maintain custom order of IDs exactly as specified in the query with the IN field. */
  | 'IN'
  /** Ordering by manually defined sort position. */
  | 'MENU_ORDER'
  /** Chronological ordering by modified date. */
  | 'MODIFIED'
  /** Maintain custom order of IDs exactly as specified in the query with the NAME_IN field. */
  | 'NAME_IN'
  /** Ordering by parent-child relationship in hierarchical content. */
  | 'PARENT'
  /** Alphabetical ordering by URL-friendly name. */
  | 'SLUG'
  /** Alphabetical ordering by content title */
  | 'TITLE';

/** Arguments for filtering the RootQueryToTermNodeConnection connection */
export type RootQueryToTermNodeConnectionWhereArgs = {
  /** Unique cache key to be produced when this query is stored in an object cache. Default is 'core'. */
  cacheDomain?: string | null | undefined;
  /** Term ID to retrieve child terms of. If multiple taxonomies are passed, $child_of is ignored. Default 0. */
  childOf?: number | null | undefined;
  /** True to limit results to terms that have no children. This parameter has no effect on non-hierarchical taxonomies. Default false. */
  childless?: boolean | null | undefined;
  /** Retrieve terms where the description is LIKE the input value. Default empty. */
  descriptionLike?: string | null | undefined;
  /** Array of term ids to exclude. If $include is non-empty, $exclude is ignored. Default empty array. */
  exclude?: Array<string | number | null | undefined> | null | undefined;
  /** Array of term ids to exclude along with all of their descendant terms. If $include is non-empty, $exclude_tree is ignored. Default empty array. */
  excludeTree?: Array<string | number | null | undefined> | null | undefined;
  /** Whether to hide terms not assigned to any posts. Accepts true or false. Default false */
  hideEmpty?: boolean | null | undefined;
  /** Whether to include terms that have non-empty descendants (even if $hide_empty is set to true). Default true. */
  hierarchical?: boolean | null | undefined;
  /** Array of term ids to include. Default empty array. */
  include?: Array<string | number | null | undefined> | null | undefined;
  /** Array of names to return term(s) for. Default empty. */
  name?: Array<string | null | undefined> | null | undefined;
  /** Retrieve terms where the name is LIKE the input value. Default empty. */
  nameLike?: string | null | undefined;
  /** Array of object IDs. Results will be limited to terms associated with these objects. */
  objectIds?: Array<string | number | null | undefined> | null | undefined;
  /** Direction the connection should be ordered in */
  order?: OrderEnum | null | undefined;
  /** Field(s) to order terms by. Defaults to 'name'. */
  orderby?: TermObjectsConnectionOrderbyEnum | null | undefined;
  /** Whether to pad the quantity of a term's children in the quantity of each term's "count" object variable. Default false. */
  padCounts?: boolean | null | undefined;
  /** Parent term ID to retrieve direct-child terms of. Default empty. */
  parent?: number | null | undefined;
  /** Search criteria to match terms. Will be SQL-formatted with wildcards before and after. Default empty. */
  search?: string | null | undefined;
  /** Array of slugs to return term(s) for. Default empty. */
  slug?: Array<string | null | undefined> | null | undefined;
  /** The Taxonomy to filter terms by */
  taxonomies?: Array<TaxonomyEnum | null | undefined> | null | undefined;
  /**
   * Array of term taxonomy IDs, to match when querying terms.
   * @deprecated Use `termTaxonomyId` instead. This will be removed in the next major version of WPGraphQL.
   */
  termTaxonomId?: Array<string | number | null | undefined> | null | undefined;
  /** Array of term taxonomy IDs, to match when querying terms. */
  termTaxonomyId?: Array<string | number | null | undefined> | null | undefined;
  /** Whether to prime meta caches for matched terms. Default true. */
  updateTermMetaCache?: boolean | null | undefined;
};

/** Available classification systems for organizing content. Identifies the different taxonomy types that can be used for content categorization. */
export type TaxonomyEnum =
  /** Taxonomy enum category */
  | 'CATEGORY'
  /** Taxonomy enum post_format */
  | 'POSTFORMAT'
  /** Taxonomy enum post_tag */
  | 'TAG';

/** Sorting attributes for taxonomy term collections. Determines which property of taxonomy terms is used for ordering results. */
export type TermObjectsConnectionOrderbyEnum =
  /** Ordering by number of associated content items. */
  | 'COUNT'
  /** Alphabetical ordering by term description text. */
  | 'DESCRIPTION'
  /** Alphabetical ordering by term name. */
  | 'NAME'
  /** Alphabetical ordering by URL-friendly name. */
  | 'SLUG'
  /** Ordering by assigned term grouping value. */
  | 'TERM_GROUP'
  /** Ordering by internal identifier. */
  | 'TERM_ID'
  /** Ordering by manually defined sort position. */
  | 'TERM_ORDER';

export type AvatarDataQueryVariables = Exact<{
  userId: string | number;
}>;


export type AvatarDataQuery = { user: { username: string | null, uri: string | null, avatar: { url: string | null } | null } | null };

export type LatestPostsQueryVariables = Exact<{
  first: number;
  order: OrderEnum;
  orderby: PostObjectsConnectionOrderbyEnum;
  authorIn?: Array<string | number | null | undefined> | string | number | null | undefined;
  categoryIn?: Array<string | number | null | undefined> | string | number | null | undefined;
}>;


export type LatestPostsQuery = { posts: { nodes: Array<{ id: string, databaseId: number, uri: string | null, date: string | null, title: string | null, excerpt: string | null, content: string | null, author: { node: { name: string | null } } | null, featuredImage: { node: { sourceUrl: string | null, altText: string | null, mediaDetails: { width: number | null, height: number | null } | null } } | null }> } | null };

export type NavigationMenuBlocksQueryVariables = Exact<{
  id: string | number;
}>;


export type NavigationMenuBlocksQuery = { navigationMenu: { blocksJSON: string | null } | null };

export type PostAuthorDataQueryVariables = Exact<{
  uri: string;
}>;


export type PostAuthorDataQuery = { nodeByUri:
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number, author: { node: { name: string | null, description: string | null, avatar: { url: string | null } | null } } | null }
    | { databaseId: number, author: { node: { name: string | null, avatar: { url: string | null } | null } } | null }
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number }
    | Record<PropertyKey, never>
   | null };

export type PostAuthorNameDataQueryVariables = Exact<{
  uri: string;
}>;


export type PostAuthorNameDataQuery = { nodeByUri:
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number, author: { node: { name: string | null, uri: string | null } } | null }
    | { databaseId: number, author: { node: { name: string | null } } | null }
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number }
    | Record<PropertyKey, never>
   | null };

export type PostDateGeneralSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type PostDateGeneralSettingsQuery = { generalSettings: { dateFormat: string | null } | null };

export type PostDateDataQueryVariables = Exact<{
  uri: string;
}>;


export type PostDateDataQuery = { generalSettings: { dateFormat: string | null } | null, nodeByUri:
    | { __typename: 'BlockEditorPreview', databaseId: number }
    | { __typename: 'Category' }
    | { __typename: 'Comment' }
    | { __typename: 'ContentType' }
    | { __typename: 'MediaItem', databaseId: number }
    | { __typename: 'NavigationMenu', databaseId: number }
    | { __typename: 'Page', databaseId: number, date: string | null, modified: string | null, uri: string | null }
    | { __typename: 'Post', databaseId: number, date: string | null, modified: string | null, uri: string | null }
    | { __typename: 'PostFormat' }
    | { __typename: 'ReusableBlock', databaseId: number }
    | { __typename: 'Tag' }
    | { __typename: 'Template', databaseId: number }
    | { __typename: 'TemplatePart', databaseId: number }
    | { __typename: 'User' }
   | null };

export type PostExcerptDataQueryVariables = Exact<{
  uri: string;
}>;


export type PostExcerptDataQuery = { nodeByUri:
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number, excerpt: string | null }
    | { databaseId: number, excerpt: string | null }
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number }
    | Record<PropertyKey, never>
   | null };

export type PostFeaturedImageByPostIdQueryVariables = Exact<{
  postId: string | number;
}>;


export type PostFeaturedImageByPostIdQuery = { post: { databaseId: number, featuredImage: { node: { sourceUrl: string | null, altText: string | null, mediaDetails: { width: number | null, height: number | null } | null } } | null } | null };

export type PostFeaturedImageDataQueryVariables = Exact<{
  uri: string;
}>;


export type PostFeaturedImageDataQuery = { nodeByUri:
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number, featuredImage: { node: { sourceUrl: string | null, altText: string | null, mediaDetails: { width: number | null, height: number | null } | null } } | null }
    | { databaseId: number, featuredImage: { node: { sourceUrl: string | null, altText: string | null, mediaDetails: { width: number | null, height: number | null } | null } } | null }
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number }
    | Record<PropertyKey, never>
   | null };

export type PostNavigationLinkContextQueryVariables = Exact<{
  uri: string;
}>;


export type PostNavigationLinkContextQuery = { nodeByUri:
    | { __typename: 'BlockEditorPreview' }
    | { __typename: 'Category' }
    | { __typename: 'Comment' }
    | { __typename: 'ContentType' }
    | { __typename: 'MediaItem' }
    | { __typename: 'NavigationMenu' }
    | { __typename: 'Page', databaseId: number, date: string | null }
    | { __typename: 'Post', databaseId: number, date: string | null, categories: { nodes: Array<{ databaseId: number }> } | null, tags: { nodes: Array<{ databaseId: number }> } | null }
    | { __typename: 'PostFormat' }
    | { __typename: 'ReusableBlock' }
    | { __typename: 'Tag' }
    | { __typename: 'Template' }
    | { __typename: 'TemplatePart' }
    | { __typename: 'User' }
   | null };

export type PostNavigationLinkAdjacentPostQueryVariables = Exact<{
  before?: DateInput | null | undefined;
  after?: DateInput | null | undefined;
  order: OrderEnum;
  categoryIn?: Array<string | number | null | undefined> | string | number | null | undefined;
  tagIn?: Array<string | number | null | undefined> | string | number | null | undefined;
  notIn?: Array<string | number | null | undefined> | string | number | null | undefined;
}>;


export type PostNavigationLinkAdjacentPostQuery = { posts: { nodes: Array<{ databaseId: number, date: string | null, uri: string | null, title: string | null }> } | null };

export type PostNavigationLinkAdjacentPageQueryVariables = Exact<{
  before?: DateInput | null | undefined;
  after?: DateInput | null | undefined;
  order: OrderEnum;
  notIn?: Array<string | number | null | undefined> | string | number | null | undefined;
}>;


export type PostNavigationLinkAdjacentPageQuery = { pages: { nodes: Array<{ databaseId: number, date: string | null, uri: string | null, title: string | null }> } | null };

export type PostTermsCategoriesQueryVariables = Exact<{
  uri: string;
}>;


export type PostTermsCategoriesQuery = { nodeByUri:
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number, categories: { nodes: Array<{ databaseId: number, name: string | null, uri: string | null }> } | null }
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number }
    | Record<PropertyKey, never>
   | null };

export type PostTermsTagsQueryVariables = Exact<{
  uri: string;
}>;


export type PostTermsTagsQuery = { nodeByUri:
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number, tags: { nodes: Array<{ databaseId: number, name: string | null, uri: string | null }> } | null }
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number }
    | Record<PropertyKey, never>
   | null };

export type PostTimeToReadByPostIdQueryVariables = Exact<{
  postId: string | number;
}>;


export type PostTimeToReadByPostIdQuery = { post: { __typename: 'Post', databaseId: number, blocksJSON: string | null, rawContent: string | null, renderedContent: string | null } | null };

export type PostTimeToReadByUriQueryVariables = Exact<{
  uri: string;
}>;


export type PostTimeToReadByUriQuery = { nodeByUri:
    | { __typename: 'BlockEditorPreview', databaseId: number }
    | { __typename: 'Category' }
    | { __typename: 'Comment' }
    | { __typename: 'ContentType' }
    | { __typename: 'MediaItem', databaseId: number }
    | { __typename: 'NavigationMenu', databaseId: number }
    | { __typename: 'Page', databaseId: number, blocksJSON: string | null, rawContent: string | null, renderedContent: string | null }
    | { __typename: 'Post', databaseId: number, blocksJSON: string | null, rawContent: string | null, renderedContent: string | null }
    | { __typename: 'PostFormat' }
    | { __typename: 'ReusableBlock', databaseId: number }
    | { __typename: 'Tag' }
    | { __typename: 'Template', databaseId: number }
    | { __typename: 'TemplatePart', databaseId: number }
    | { __typename: 'User' }
   | null };

export type PostTitleDataQueryVariables = Exact<{
  uri: string;
}>;


export type PostTitleDataQuery = { nodeByUri:
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number, title: string | null }
    | { databaseId: number, title: string | null }
    | { databaseId: number }
    | { databaseId: number }
    | { databaseId: number }
    | Record<PropertyKey, never>
   | null };

type QueryNodeFields_BlockEditorPreview_Fragment = { title: string | null, content: string | null, id: string, databaseId: number, uri: string | null, date: string | null, author: { node: { name: string | null } } | null };

type QueryNodeFields_MediaItem_Fragment = { title: string | null, id: string, databaseId: number, uri: string | null, date: string | null, author: { node: { name: string | null } } | null };

type QueryNodeFields_NavigationMenu_Fragment = { title: string | null, content: string | null, id: string, databaseId: number, uri: string | null, date: string | null };

type QueryNodeFields_Page_Fragment = { title: string | null, excerpt: string | null, content: string | null, id: string, databaseId: number, uri: string | null, date: string | null, author: { node: { name: string | null } } | null, featuredImage: { node: { sourceUrl: string | null, altText: string | null, mediaDetails: { width: number | null, height: number | null } | null } } | null };

type QueryNodeFields_Post_Fragment = { title: string | null, excerpt: string | null, content: string | null, id: string, databaseId: number, uri: string | null, date: string | null, author: { node: { name: string | null } } | null, featuredImage: { node: { sourceUrl: string | null, altText: string | null, mediaDetails: { width: number | null, height: number | null } | null } } | null };

type QueryNodeFields_ReusableBlock_Fragment = { title: string | null, excerpt: string | null, content: string | null, id: string, databaseId: number, uri: string | null, date: string | null };

type QueryNodeFields_Template_Fragment = { title: string | null, excerpt: string | null, content: string | null, id: string, databaseId: number, uri: string | null, date: string | null, author: { node: { name: string | null } } | null };

type QueryNodeFields_TemplatePart_Fragment = { title: string | null, excerpt: string | null, content: string | null, id: string, databaseId: number, uri: string | null, date: string | null, author: { node: { name: string | null } } | null };

export type QueryNodeFieldsFragment =
  | QueryNodeFields_BlockEditorPreview_Fragment
  | QueryNodeFields_MediaItem_Fragment
  | QueryNodeFields_NavigationMenu_Fragment
  | QueryNodeFields_Page_Fragment
  | QueryNodeFields_Post_Fragment
  | QueryNodeFields_ReusableBlock_Fragment
  | QueryNodeFields_Template_Fragment
  | QueryNodeFields_TemplatePart_Fragment
;

export type QueryPostsQueryVariables = Exact<{
  first: number;
  offset: number;
  order: OrderEnum;
  orderby: PostObjectsConnectionOrderbyEnum;
  notIn?: Array<string | number | null | undefined> | string | number | null | undefined;
  search?: string | null | undefined;
  categoryId?: number | null | undefined;
  categoryIn?: Array<string | number | null | undefined> | string | number | null | undefined;
  tagIn?: Array<string | number | null | undefined> | string | number | null | undefined;
}>;


export type QueryPostsQuery = { posts: { pageInfo: { offsetPagination: { total: number | null } | null }, nodes: Array<{ title: string | null, excerpt: string | null, content: string | null, id: string, databaseId: number, uri: string | null, date: string | null, author: { node: { name: string | null } } | null, featuredImage: { node: { sourceUrl: string | null, altText: string | null, mediaDetails: { width: number | null, height: number | null } | null } } | null }> } | null };

export type QueryContentNodesQueryVariables = Exact<{
  first: number;
  offset: number;
  order: OrderEnum;
  orderby: PostObjectsConnectionOrderbyEnum;
  notIn?: Array<string | number | null | undefined> | string | number | null | undefined;
  search?: string | null | undefined;
  contentTypes?: Array<ContentTypeEnum | null | undefined> | ContentTypeEnum | null | undefined;
  taxTermIn?: Array<string | number | null | undefined> | string | number | null | undefined;
}>;


export type QueryContentNodesQuery = { contentNodes: { pageInfo: { offsetPagination: { total: number | null } | null }, nodes: Array<
      | { title: string | null, content: string | null, id: string, databaseId: number, uri: string | null, date: string | null, author: { node: { name: string | null } } | null }
      | { title: string | null, id: string, databaseId: number, uri: string | null, date: string | null, author: { node: { name: string | null } } | null }
      | { title: string | null, content: string | null, id: string, databaseId: number, uri: string | null, date: string | null }
      | { title: string | null, excerpt: string | null, content: string | null, id: string, databaseId: number, uri: string | null, date: string | null, author: { node: { name: string | null } } | null, featuredImage: { node: { sourceUrl: string | null, altText: string | null, mediaDetails: { width: number | null, height: number | null } | null } } | null }
      | { title: string | null, excerpt: string | null, content: string | null, id: string, databaseId: number, uri: string | null, date: string | null, author: { node: { name: string | null } } | null, featuredImage: { node: { sourceUrl: string | null, altText: string | null, mediaDetails: { width: number | null, height: number | null } | null } } | null }
      | { title: string | null, excerpt: string | null, content: string | null, id: string, databaseId: number, uri: string | null, date: string | null }
      | { title: string | null, excerpt: string | null, content: string | null, id: string, databaseId: number, uri: string | null, date: string | null, author: { node: { name: string | null } } | null }
      | { title: string | null, excerpt: string | null, content: string | null, id: string, databaseId: number, uri: string | null, date: string | null, author: { node: { name: string | null } } | null }
    > } | null };

export type QueryTitleDataQueryVariables = Exact<{
  uri: string;
}>;


export type QueryTitleDataQuery = { nodeByUri:
    | { __typename: 'BlockEditorPreview' }
    | { __typename: 'Category', databaseId: number, name: string | null }
    | { __typename: 'Comment' }
    | { __typename: 'ContentType', label: string | null }
    | { __typename: 'MediaItem' }
    | { __typename: 'NavigationMenu' }
    | { __typename: 'Page' }
    | { __typename: 'Post' }
    | { __typename: 'PostFormat', databaseId: number, name: string | null }
    | { __typename: 'ReusableBlock' }
    | { __typename: 'Tag', databaseId: number, name: string | null }
    | { __typename: 'Template' }
    | { __typename: 'TemplatePart' }
    | { __typename: 'User', name: string | null }
   | null };

export type SiteLogoDataQueryVariables = Exact<{ [key: string]: never; }>;


export type SiteLogoDataQuery = { siteLogo: { sourceUrl: string | null, altText: string | null, mediaDetails: { width: number | null, height: number | null } | null } | null };

export type SiteTaglineDataQueryVariables = Exact<{ [key: string]: never; }>;


export type SiteTaglineDataQuery = { generalSettings: { description: string | null } | null };

export type SiteTitleDataQueryVariables = Exact<{ [key: string]: never; }>;


export type SiteTitleDataQuery = { generalSettings: { title: string | null } | null };

export type TaxonomyListTermsQueryVariables = Exact<{
  taxonomies: Array<TaxonomyEnum> | TaxonomyEnum;
  hideEmpty: boolean;
}>;


export type TaxonomyListTermsQuery = { terms: { nodes: Array<
      | { id: string, databaseId: number, name: string | null, slug: string | null, uri: string | null, count: number | null, parent: { node: { id: string, databaseId: number } } | null }
      | { id: string, databaseId: number, name: string | null, slug: string | null, uri: string | null, count: number | null }
      | { id: string, databaseId: number, name: string | null, slug: string | null, uri: string | null, count: number | null }
    > } | null };

export type TermNameDataQueryVariables = Exact<{
  uri: string;
}>;


export type TermNameDataQuery = { nodeByUri:
    | { databaseId: number, name: string | null, uri: string | null }
    | { databaseId: number, name: string | null, uri: string | null }
    | { databaseId: number, name: string | null, uri: string | null }
    | Record<PropertyKey, never>
   | null };

export type TermsQueryArchiveContextQueryVariables = Exact<{
  uri: string;
}>;


export type TermsQueryArchiveContextQuery = { nodeByUri:
    | { __typename: 'BlockEditorPreview' }
    | { __typename: 'Category', databaseId: number, taxonomyName: string | null }
    | { __typename: 'Comment' }
    | { __typename: 'ContentType' }
    | { __typename: 'MediaItem' }
    | { __typename: 'NavigationMenu' }
    | { __typename: 'Page' }
    | { __typename: 'Post' }
    | { __typename: 'PostFormat', databaseId: number, taxonomyName: string | null }
    | { __typename: 'ReusableBlock' }
    | { __typename: 'Tag', databaseId: number, taxonomyName: string | null }
    | { __typename: 'Template' }
    | { __typename: 'TemplatePart' }
    | { __typename: 'User' }
   | null };

export type TermsQueryTermsQueryVariables = Exact<{
  first: number;
  where: RootQueryToTermNodeConnectionWhereArgs;
}>;


export type TermsQueryTermsQuery = { terms: { nodes: Array<
      | { id: string, databaseId: number, name: string | null, slug: string | null, uri: string | null, count: number | null, taxonomyName: string | null }
      | { id: string, databaseId: number, name: string | null, slug: string | null, uri: string | null, count: number | null, taxonomyName: string | null }
      | { id: string, databaseId: number, name: string | null, slug: string | null, uri: string | null, count: number | null, taxonomyName: string | null }
    > } | null };

export type ArchiveFragment = { name: string | null, graphqlSingleName: string | null, graphqlPluralName: string | null, uri: string | null, fseTemplate: { slug: string | null } | null };

export type CategoryFragment = { uri: string | null, id: number, title: string | null, fseTemplate: { slug: string | null } | null };

export type SinglePageFragment = { title: string | null, blocksJSON: string | null, uri: string | null, isFrontPage: boolean, editLink?: string | null, id: number, ancestors: { nodes: Array<
      | { databaseId: number }
      | { databaseId: number }
      | { databaseId: number }
      | { databaseId: number }
      | { databaseId: number }
      | { databaseId: number }
      | { databaseId: number }
      | { databaseId: number }
    > } | null, fseTemplate: { slug: string | null } | null, preview?: { node: { blocksJSON: string | null } } | null, seo: { title: string | null, metaDesc: string | null, metaKeywords: string | null, metaRobotsNoindex: string | null, metaRobotsNofollow: string | null, canonical: string | null, opengraphTitle: string | null, opengraphDescription: string | null, opengraphUrl: string | null, twitterTitle: string | null, twitterDescription: string | null, opengraphImage: { src: string | null } | null, twitterImage: { src: string | null } | null, breadcrumbs: Array<{ text: string | null, url: string | null } | null> | null } | null };

export type SinglePostFragment = { title: string | null, date: string | null, blocksJSON: string | null, uri: string | null, editLink?: string | null, id: number, fseTemplate: { slug: string | null } | null, featuredImage: { node: { sourceUrl: string | null, altText: string | null, mediaDetails: { width: number | null, height: number | null } | null } } | null, categories: { nodes: Array<{ databaseId: number, name: string | null, uri: string | null, id: number }> } | null, tags: { nodes: Array<{ databaseId: number, name: string | null, uri: string | null, id: number }> } | null, preview?: { node: { blocksJSON: string | null } } | null, seo: { title: string | null, metaDesc: string | null, metaKeywords: string | null, metaRobotsNoindex: string | null, metaRobotsNofollow: string | null, canonical: string | null, opengraphTitle: string | null, opengraphDescription: string | null, opengraphUrl: string | null, twitterTitle: string | null, twitterDescription: string | null, opengraphImage: { src: string | null } | null, twitterImage: { src: string | null } | null, breadcrumbs: Array<{ text: string | null, url: string | null } | null> | null } | null };

export type TagFragment = { uri: string | null, id: number, title: string | null, fseTemplate: { slug: string | null } | null };

export type SeoTaxFragment = { title: string | null, metaDesc: string | null, metaKeywords: string | null, metaRobotsNoindex: string | null, metaRobotsNofollow: string | null, canonical: string | null, opengraphTitle: string | null, opengraphDescription: string | null, opengraphUrl: string | null, twitterTitle: string | null, twitterDescription: string | null, opengraphImage: { src: string | null } | null, twitterImage: { src: string | null } | null, breadcrumbs: Array<{ text: string | null, url: string | null } | null> | null };

export type SeoPostTypeFragment = { title: string | null, metaDesc: string | null, metaKeywords: string | null, metaRobotsNoindex: string | null, metaRobotsNofollow: string | null, canonical: string | null, opengraphTitle: string | null, opengraphDescription: string | null, opengraphUrl: string | null, twitterTitle: string | null, twitterDescription: string | null, opengraphImage: { src: string | null } | null, twitterImage: { src: string | null } | null, breadcrumbs: Array<{ text: string | null, url: string | null } | null> | null };

export type FseTemplatesQueryVariables = Exact<{ [key: string]: never; }>;


export type FseTemplatesQuery = { allTemplates: Array<{ slug: string | null, blocksJSON: string | null } | null> | null, allTemplateParts: Array<{ area: string | null, slug: string | null, blocksJSON: string | null, language: { baseSlug: string | null, code: string | null } | null } | null> | null };

export type NotFoundBreadcrumbsQueryVariables = Exact<{ [key: string]: never; }>;


export type NotFoundBreadcrumbsQuery = { seo: { breadcrumbs: { enabled: boolean | null, homeText: string | null, notFoundText: string | null } | null } | null };

export type RedirectionsQueryVariables = Exact<{
  uri: string;
}>;


export type RedirectionsQuery = { redirections: Array<{ code: number | null, target: string | null } | null> | null };
