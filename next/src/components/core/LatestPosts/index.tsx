import CardPost from '@/components/molecules/Cards/CardPost';
import './styles.css';

export default function LatestPosts(props: LatestPostProps) {
  return (
    <div
      className="wp-block-post-content"
      style={{ '--latest-posts-nb': props.postsToShow } as React.CSSProperties}
    >
      {props.data?.posts?.nodes?.map((post) => (
        <CardPost
          key={post.id}
          title={post.title || ''}
          excerpt={
            props.displayPostContent
              ? post.excerpt
                  ?.split(' ')
                  .slice(0, props.excerptLength)
                  .join(' ') + '...' || ''
              : null
          }
          featuredimage={
            props.displayFeaturedImage
              ? {
                  url: post.featuredImage?.node?.sourceUrl || '',
                  alt: post.featuredImage?.node?.altText || '',
                  width: post.featuredImage?.node?.mediaDetails?.width,
                  height: post.featuredImage?.node?.mediaDetails?.height,
                }
              : null
          }
          date={props.displayPostDate ? post.date || null : null}
          link={post.uri}
          author={
            props.displayAuthor ? { name: post.author?.node?.name || '' } : null
          }
        />
      ))}
    </div>
  );
}
