interface PostNavigationLinkAttributes extends BlockAttributes {
	arrow: 'none' | 'chevron' | 'arrow';
	linkLabel: boolean;
	showTitle: boolean;
	taxonomy: string;
	type: 'next' | 'previous';
	navigationPost?: {
		uri: string;
		title: string;
		type: 'next' | 'previous';
	} | null;
}

type PostNavigationLinkProps = PostNavigationLinkAttributes;
