import {
	singleCategoryData,
	singlePageData,
	singlePostData,
	singleTagData,
} from '@/components/templates/data';

export const POST_TYPES_SINGLE_SLUGS = ['page', 'post'];
export const POST_TYPES_PLURAL_SLUGS = ['pages', 'posts'];
export const POST_TYPES_GRAPHQL_SINGLE_NAMES = ['Page', 'Post'];

export const TAXONOMIES_PLURAL_SLUGS = ['tags', 'categories'];

// Needed for the nodeByUri query to fetch the correct fields for the node
export const NODE_TYPES = [
	{
		type: 'Page',
		fragment: singlePageData.fragment,
		fields: 'singlePageFragment',
	},
	{
		type: 'Post',
		fragment: singlePostData.fragment,
		fields: 'singlePostFragment',
	},
	{
		type: 'Tag',
		fragment: singleTagData.fragment,
		fields: 'singleTagFragment',
	},
	{
		type: 'Category',
		fragment: singleCategoryData.fragment,
		fields: 'singleCategoryFragment',
	},
];
