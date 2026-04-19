import Avatar from '../Avatar';
import './styles.css';

export default function PostAuthor(props: PostAuthorProps) {
  const Tag = props.isLink ? 'a' : 'p';

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
        <Tag
          className="wp-block-post-author__name"
          {...(props.isLink
            ? { href: props.author.uri, target: props.linkTarget }
            : {})}
        >
          {props.author.name}
        </Tag>
        {props.showBio && (
          <p className="wp-block-post-author__bio">
            {props.author.description}
          </p>
        )}
      </div>
    </div>
  );
}
