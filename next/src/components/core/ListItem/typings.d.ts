interface ListItemAttributes
	extends React.HTMLProps<HTMLLIElement>,
		BlockAttributes {
	content: string;
}

interface ListItemProps extends ListItemAttributes {}
