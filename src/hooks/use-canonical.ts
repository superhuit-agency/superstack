interface NodeStructure {
	uri?: string;
	seo?: {
		canonical?: string;
	};
	baseUrl?: string;
	language?: {
		code: string;
	};
}

export const useCanonical = (node: unknown): string => {
	if (!node || typeof node !== 'object' || Object.keys(node).length === 0)
		return '/';

	const typedNode = node as NodeStructure;

	let url = typedNode.uri ?? '/';

	if (typedNode.seo?.canonical) return typedNode.seo.canonical;

	if (typedNode.uri === '/' && typedNode.language) {
		url = `/${typedNode.language.code.toLowerCase()}/`;
	}

	return `${typedNode?.baseUrl || ''}${url}`;
};
