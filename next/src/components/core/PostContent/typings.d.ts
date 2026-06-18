interface PostContentAttributes {
	tagName?: TagName;
}

interface PostContentProps
	extends React.HTMLProps<HTMLDivElement>, PostContentAttributes {}
