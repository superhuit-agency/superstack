import cx from 'classnames';
import './styles.css';

// Internal dependencies
import block from './block.json';

function Paragraph({ content, className }: ParagraphProps) {
  if (!content) return null;

  return (
    <p
      className={cx('supt-paragraph', className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

Paragraph.slug = block.slug;
Paragraph.title = block.title;

export default Paragraph;
