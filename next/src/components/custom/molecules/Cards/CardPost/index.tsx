import NextImage from 'next/image';

import Heading from '@/components/core/Heading';

import './styles.css';

export default function CardPost(props: CardPostProps) {
  return (
    <article className="supt-card-post">
      {props.featuredimage && (
        <div className="supt-card-post__image-container">
          <NextImage
            src={props.featuredimage.src}
            alt={props.featuredimage.alt}
            width={props.featuredimage.width}
            height={props.featuredimage.height}
            className="supt-card-post__image"
          />
        </div>
      )}
      <div className="supt-card-post__content">
        {props.date && (
          <div className="supt-card-post__date">
            <time dateTime={props.date}>
              {new Date(props.date).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          </div>
        )}
        {props.title && (
          <Heading
            level={3}
            className="supt-card-post__title"
            content={props.title}
          />
        )}
        {props.author && (
          <div className="supt-card-post__author">
            <span className="supt-card-post__author-name">
              {props.author.name}
            </span>
          </div>
        )}
        {props.excerpt && (
          <div
            className="supt-card-post__excerpt"
            dangerouslySetInnerHTML={{ __html: props.excerpt }}
          />
        )}
        <a href={props.link} className="supt-card-post__link">
          Read More
        </a>
      </div>
    </article>
  );
}
