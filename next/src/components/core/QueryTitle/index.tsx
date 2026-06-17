import cx from 'classnames';

import Heading from '../Heading';

export default function QueryTitle({ level = 1, content, textAlign, className }: QueryTitleProps) {
  if (!content) return null;

  if (level === 0) {
    return (
      <p
        className={cx('wp-block-query-title', className, {
          '-center': textAlign === 'center',
          '-right': textAlign === 'right',
          '-left': textAlign === 'left',
        })}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return <Heading level={level} content={content} textAlign={textAlign} className={className} />;
}
