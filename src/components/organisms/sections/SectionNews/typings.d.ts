interface GraphqlSectionNewsQueryArgs {
	categoryIn?: Array<number>;
	offset?: number;
	postIn?: Array<number>;
	size?: number;
	stati?: Array<PostStatusEnum>;
	tagIn?: Array<number>;
}

interface GraphqlSectionNewsFields {
	posts: { nodes: Array<GraphQLCardNewsFields> };
}

interface SectionNewsAttributes extends SectionAttributes {
	postLinkLabel?: string;
	queryVars?: GraphqlSectionNewsQueryArgs;
	seeAllLink?: LinkProps;
}

interface SectionNewsData {
	posts: Array<CardNewsProps>;
}

interface SectionNewsProps
	extends SectionNewsAttributes,
		SectionNewsData,
		SectionProps {}
