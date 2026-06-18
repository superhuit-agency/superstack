import cx from 'classnames';

import './styles.css';

export default function SiteTitle({ content, textAlign }: SiteTitleProps) {
	return (
		<p
			className={cx('wp-block-site-title', {
				'-center': textAlign === 'center',
				'-right': textAlign === 'right',
				'-left': textAlign === 'left',
			})}
		>
			{content}
		</p>
	);
}
