import { FC } from 'react';
// internal imports
import block from './block.json';
// styles
import './styles.css';

export const Link: FC<LinkProps> & BlockConfigs = ({
	href,
	prefetch,
	scroll,
}) => {
	return (
		<div className="supt-link">
			<div className="supt-link__inner"></div>
		</div>
	);
};

Link.slug = block.slug;
Link.title = block.title;
