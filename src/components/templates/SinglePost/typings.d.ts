type SinglePageData = ReturnType<typeof formatter>;

interface SinglePageProps {
	node: SinglePageData & any;
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

interface GraphQLSinglePostFields
	extends GraphQLNodeFields,
		GraphQLContentNodeFields {
	featuredImage: {
		node: GraphQLImageFields;
	};
	categories: {
		nodes: Array<TaxonomyType>;
	};
	tags: {
		nodes: Array<TaxonomyType>;
	};
	relatedPosts: {
		size: number;
		categoryIn: Array<number>;
		tagIn: Array<number>;
		notIn: Array<number>;
	};
}
