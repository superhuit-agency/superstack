interface GraphQLSingleCategoryFields extends GraphQLNodeFields {
	description: string;

	archivePage: {
		baseUri: string;
		perPage: number;
		type: string;
	};
}

interface SingleCategoryNodeProps extends ArchivePostData, ContentNodeData {
	language: Language;
	fullUri: string;
}

interface SingleCategoryData extends ArchivePostData {
	blocksJSON: Array<BlockPropsType>;
}
