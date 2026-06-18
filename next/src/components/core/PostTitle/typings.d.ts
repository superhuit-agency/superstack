interface PostTitleAttributes extends BlockAttributes {
	isLink?: boolean;
	linkTarget?: string;
	rel?: string;
	level?: number;
}

interface PostTitleProps extends PostTitleAttributes {
	content: string;
}
