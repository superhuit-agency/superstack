interface HeadingAttributes extends BlockAttributes {
	content: string;
	level: number;
}

interface HeadingProps extends HeadingAttributes {
	className?: string;
}
