import cx from 'classnames';

import block from './block.json';
import './styles.css';

export default function Spacer(props: SpacerProps) {
	return (
		<div
			className={cx('wp-block-spacer', props.className, {
				'-fill-width': props.style?.layout?.selfStretch === 'fill',
				'-fixed-width': props.style?.layout?.selfStretch === 'fixed',
			})}
			style={{
				height: props.height,
				width:
					props.style?.layout?.selfStretch === 'fixed'
						? props.style?.layout?.flexSize
						: props.width,
			}}
			aria-hidden="true"
		/>
	);
}

Spacer.slug = block.slug;
Spacer.title = block.title;
