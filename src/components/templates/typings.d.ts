interface GraphQLContentNodeFields {
	blocksJSON: string;
	editLink?: string;
	preview?: {
		node: {
			blocksJSON: string;
		};
	};
}

interface GraphQLNodeFields {
	id: number;
	title: string;
	uri: string;

	seo: {
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
		};
		breadcrumbs: {
			text: string;
			url: string;
		};
	};
	language?: {
		code: string;
		locale: string;
	};
	translations?: {
		uri: string;
		language: {
			locale: string;
			code: string;
		};
	};
}

interface ContentNodeData
	extends GraphQLNodeFields,
		Omit<GraphQLContentNodeFields, 'preview'> {
	blocksJSON: Array<BlockPropsType>;
}
