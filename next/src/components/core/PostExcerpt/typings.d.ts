interface PostExcerptAttributes extends BlockAttributes {
	excerptLength: number;
	level: number;
	showMoreOnNewLine: boolean;
	children: React.ReactNode;
}

interface PostExcerptProps extends PostExcerptAttributes {
	content: string;
}
