interface CardNewsProps {
	category?: LinkProps;
	date: string;
	excerpt?: string;
	image?: ImageProps;
	linkLabel?: string;
	title: string;
	uri: string;
}

interface GraphQLCardNewsFields {
	blocksJSON: string;
	categories: {
		nodes: Array<{
			title: string;
			href: string;
		}>;
	};
	date: string;
	id: number;
	image: GraphQLMediaFields;
	postAcf: {
		excerpt: string;
	};
	title: string;
	uri: string;
}
