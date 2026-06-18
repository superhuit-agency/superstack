interface PostAuthorNameAttributes extends BlockAttributes {
	isLink: boolean;
	linkTarget: string;
}

interface PostAuthorNameProps extends PostAuthorNameAttributes {
	name: string;
	uri: string;
}
