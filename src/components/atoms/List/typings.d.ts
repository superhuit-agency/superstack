interface ListAttributes
	extends React.HTMLProps<HTMLUListElement>,
		BlockAttributes {
	ordered: boolean;
	reversed?: boolean;
	start?: number;
}

interface ListProps extends ListAttributes {}
