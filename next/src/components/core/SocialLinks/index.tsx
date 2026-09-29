import cx from 'classnames';

import './styles.css';

export default function SocialLinks(props: SocialLinksProps) {
	// `align` is only set when the block is aligned as a whole; the row's own
	// justification is saved by the editor under `layout`.
	const justification = props.layout?.justifyContent ?? props.align;

	return (
		<ul
			className={cx('wp-block-social-links', props.className, {
				'-is-aligned-left': justification === 'left',
				'-is-aligned-center': justification === 'center',
				'-is-aligned-right': justification === 'right',
				'-is-aligned-space-between': justification === 'space-between',
			})}
		>
			{props.children}
		</ul>
	);
}
