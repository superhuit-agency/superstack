import cx from 'classnames';
import './styles.css';

// Internal dependencies
import block from './block.json';

function Paragraph({ content, className, fontSize }: ParagraphProps) {
	if (!content) return null;

	return (
		<p
			className={cx('wp-block-paragraph', className, {
				[`is-style-${fontSize}`]: fontSize,
			})}
			dangerouslySetInnerHTML={{ __html: content }}
		/>
	);
}

Paragraph.slug = block.slug;
Paragraph.title = block.title;

export default Paragraph;
