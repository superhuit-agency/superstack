import CardPost from '@/components/custom/molecules/Cards/CardPost';
import './styles.css';

export default function Query(props: QueryProps) {
  const hasPosts = props.data.posts.nodes.length > 0;
  return (
    <div className="wp-block-query">
      {hasPosts && (
        <div className="wp-block-query__posts">
          {props.data.posts.nodes.map((post) => (
            <CardPost
              key={post.id}
              title={post.title}
              excerpt={post.excerpt}
              link={post.uri}
              date={post.date}
              author={post.author?.node || null}
              featuredimage={
                post.featuredImage
                  ? {
                      src: post.featuredImage?.node?.sourceUrl || '',
                      alt: post.featuredImage?.node?.altText || '',
                      width: post.featuredImage?.node?.mediaDetails?.width,
                      height: post.featuredImage?.node?.mediaDetails?.height,
                    }
                  : null
              }
            />
          ))}
        </div>
      )}
      {props.children}
    </div>
  );
}
