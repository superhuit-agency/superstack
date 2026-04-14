interface SinglePageData {}

interface SinglePageNodeProps extends SinglePageData, ContentNodeData {}
interface SinglePageProps {
	node: SinglePageNodeProps;
}

type GraphQLSinglePageFields = {
	posts: {
		nodes: Array<CardnewsData>;
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
};

type SinglePageFormatterArgs = GraphQLSinglePageFields & {
	currentPage: number;
};

interface GraphQLSinglePageFields
	extends GraphQLNodeFields,
		GraphQLContentNodeFields {
	isFrontPage;
	archivePage: {
		baseUri: string;
		perPage: number;
		type: string;
	};
}
