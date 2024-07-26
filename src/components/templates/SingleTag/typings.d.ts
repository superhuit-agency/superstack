interface GraphQLSingleTagFields extends GraphQLNodeFields {
	description: string;

	archivePage: {
		baseUri: string;
		perPage: number;
		type: string;
	};
}
