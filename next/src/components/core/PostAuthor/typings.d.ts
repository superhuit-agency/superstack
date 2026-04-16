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
    avatar: {
      url: string;
    };
    name: string;
    description: string;
  };
}
