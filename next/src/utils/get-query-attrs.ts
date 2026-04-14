export function getQueryAttrs(query: string) {
	const match = query.match(/((?:query)|(?:mutation)) ([^\(\{\s]+)/);
	if (match) {
		const [_, type, name] = match;
		return {
			type,
			name,
		};
	} else {
		return {
			type: '',
			name: '',
		};
	}
}
