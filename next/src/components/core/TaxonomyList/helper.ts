export const taxonomyToGraphqlEnum = (taxonomy: string) => {
	if (taxonomy === 'category') return 'CATEGORY';
	if (taxonomy === 'post_tag') return 'TAG';

	return taxonomy.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase();
};

export const getTermParentKey = (term: TaxonomyTerm): string | null => {
	if (term.parent?.node?.id) return term.parent.node.id;
	if (typeof term.parent?.node?.databaseId === 'number') {
		return `db:${term.parent.node.databaseId}`;
	}

	return null;
};

export const getTermKey = (term: TaxonomyTerm): string => {
	if (term.id) return term.id;
	if (typeof term.databaseId === 'number') return `db:${term.databaseId}`;
	return term.slug;
};

export const toTree = (terms: TaxonomyTerm[]) => {
	const byParent = new Map<string | null, TaxonomyTerm[]>();

	for (const term of terms) {
		const parentKey = getTermParentKey(term);
		const list = byParent.get(parentKey) ?? [];
		list.push(term);
		byParent.set(parentKey, list);
	}

	return byParent;
};
