interface GraphQLSingleCategoryFields extends GraphQLNodeFields {
	description: string;

	archivePage: {
		baseUri: string;
		perPage: number;
		type: string;
	};
}
