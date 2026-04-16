import CardPost from '@/components/custom/molecules/Cards/CardPost';
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
                  src: post.featuredImage?.node?.sourceUrl || '',
                  alt: post.featuredImage?.node?.altText || '',
                  width: post.featuredImage?.node?.mediaDetails?.width || 0,
                  height: post.featuredImage?.node?.mediaDetails?.height || 0,
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
