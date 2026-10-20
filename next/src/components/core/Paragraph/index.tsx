import cx from 'classnames';
import './styles.css';

// Internal dependencies
import block from './block.json';

const WRAPPED_IN_P = /^\s*<p(?:\s[^>]*)?>([\s\S]*)<\/p>\s*$/i;
const P_TAG = /<\/?p[\s>]/i;

/**
 * Strips a single outer <p> from content, as a block registry seeded with an
 * `html` source returns it, so it doesn't end up nested in our own <p>.
 */
function unwrapParagraph(content: string) {
	const inner = content.match(WRAPPED_IN_P)?.[1];

	return inner === undefined || P_TAG.test(inner) ? content : inner;
}

function Paragraph({ content, className, fontSize }: ParagraphProps) {
	if (!content) return null;

	return (
		<p
			className={cx('wp-block-paragraph', className, {
				[`is-style-${fontSize}`]: fontSize,
			})}
			dangerouslySetInnerHTML={{ __html: unwrapParagraph(content) }}
		/>
	);
}

Paragraph.slug = block.slug;
Paragraph.title = block.title;

export default Paragraph;
