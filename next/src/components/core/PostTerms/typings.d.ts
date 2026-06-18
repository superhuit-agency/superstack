interface PostTermsAttributes extends BlockAttributes {
	prefix: string;
	separator: string;
	suffix: string;
	term: 'category' | 'post_tag';
}

interface PostTermsProps extends HTMLDivElement, PostTermsAttributes {
	categories: {
		name: string;
		uri: string;
	}[];
	tags: {
		name: string;
		uri: string;
	}[];
}
