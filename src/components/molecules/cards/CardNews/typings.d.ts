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
	id: number;
	title: string;
	date: string;
	uri: string;
	blocksJSON: string;
	image: MediaNodeType;
	postAcf: {
		excerpt: string;
	};
}
