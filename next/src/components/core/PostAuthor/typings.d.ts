interface PostAuthorAttributes extends BlockAttributes {
	avatarSize: number;
	byline: string;
	isLink: boolean;
	linkTarget: string;
	showAvatar: boolean;
	showBio: boolean;
}

interface PostAuthorProps extends PostAuthorAttributes {
	author: {
		uri: string;
		// `null` when avatars are turned off in WordPress
		avatar: {
			url: string;
		} | null;
		name: string;
		description: string;
	};
}
