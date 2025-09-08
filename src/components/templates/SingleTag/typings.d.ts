interface GraphQLSingleTagFields extends GraphQLNodeFields {
	description: string;

	archivePage: {
		baseUri: string;
		perPage: number;
		type: string;
	};
}

interface SingleTagNodeProps extends ArchivePostData, ContentNodeData {
	language: Language;
	fullUri: string;
	relatedPosts: {
		size: number;
		categoryIn: Array<number>;
		tagIn: Array<number>;
		notIn: Array<number>;
	};
}

interface SingleTagData {
	blocksJSON: Array<BlockPropsType>;
	archivePage: {
		baseUri: string;
		perPage: number;
		type: string;
	};
}
