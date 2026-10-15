interface SinglePageData {}

interface SinglePageNodeProps extends SinglePageData, ContentNodeData {}
interface SinglePageProps {
	node: SinglePageNodeProps;
}

interface GraphQLSinglePageFields
	extends GraphQLNodeFields, GraphQLContentNodeFields {
	isFrontPage;
}
