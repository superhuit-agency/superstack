interface TermNameAttributes extends BlockAttributes {
	level?: number;
	isLink?: boolean;
	textAlign?: 'left' | 'right' | 'center';
}

interface TermNameProps extends TermNameAttributes {
	content: string;
	uri?: string | null;
}
