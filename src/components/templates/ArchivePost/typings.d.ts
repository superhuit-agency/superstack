interface TaxonomyType extends LinkProps {
	isActive?: boolean;
}

interface ArchivePostData {
	archivePage: {
		baseUri: string;
		categories: Array<TaxonomyType>;
		pagination: {
			current: number;
			total: number;
		};
		perPage: number;
		posts: Array<CardNewsProps>;
		tags: Array<TaxonomyType>;
		type: string;
	};
}

interface ArchivePostNodeProps extends ArchivePostData, ContentNodeData {}
interface ArchivePostProps {
	node: ArchivePostNodeProps;
}

interface GraphqlArchivePostFields {
	posts: {
		nodes: Array<GraphQLCardNewsFields>;
		pageInfo: {
			offsetPagination: {
				total: number;
			};
		};
	};
	categories: {
		nodes: Array<TaxonomyType>;
	};
	tags: {
		nodes: Array<TaxonomyType>;
	};
}

interface ArchivePostFormatterArgs extends GraphqlArchivePostFields {
	currentPage: number;
}
