import Avatar from '../Avatar';
import PostAuthorName from '../PostAuthorName';
import './styles.css';

export default function PostAuthor(props: PostAuthorProps) {
  return (
    <div className="wp-block-post-author">
      {props.showAvatar && (
        <Avatar
          className="wp-block-post-author__avatar"
          data={{
            url: props.author.avatar.url,
            alt: props.author.name,
            uri: '',
          }}
          size={props.avatarSize}
        />
      )}
      <div className="wp-block-post-author__content">
        {props.byline && (
          <p className="wp-block-post-author__byline">{props.byline}</p>
        )}
        <PostAuthorName
          name={props.author.name}
          uri={props.author.uri}
          isLink={props.isLink}
          linkTarget={props.linkTarget}
        />
        {props.showBio && (
          <p className="wp-block-post-author__bio">
            {props.author.description}
          </p>
        )}
      </div>
    </div>
  );
}
