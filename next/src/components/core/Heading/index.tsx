import cx from 'classnames';

import './styles.css';

function Heading({ className = '', content, level = 1, textAlign }: HeadingProps) {
  const HTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

	if (!content) return null;

	return (
		<HTag
			className={cx('wp-block-heading', className, {
				'-center': textAlign === 'center',
				'-right': textAlign === 'right',
				'-left': textAlign === 'left',
			})}
			dangerouslySetInnerHTML={{ __html: content }}
		/>
	);
}

export default Heading;
