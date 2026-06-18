import cx from 'classnames';

import './styles.css';

export default function SiteTagline({ content, textAlign }: SiteTaglineProps) {
	return (
		<p
			className={cx('wp-block-site-tagline', {
				'-center': textAlign === 'center',
				'-right': textAlign === 'right',
				'-left': textAlign === 'left',
			})}
		>
			{content}
		</p>
	);
}
