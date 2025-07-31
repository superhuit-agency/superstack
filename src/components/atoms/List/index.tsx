import { FC } from 'react';

import block from './block.json';

// styles
import './styles.css';

export const List: FC<ListProps> & BlockConfigs = ({
	ordered,
	reversed,
	start,
	type,
	children,
}) => {
	return (
		<>
			{ordered ? (
				<ol
					className="supt-list"
					reversed={reversed}
					start={start}
					style={{
						listStyleType: type,
					}}
				>
					{children}
				</ol>
			) : (
				<ul className="supt-list">{children}</ul>
			)}
		</>
	);
};

List.slug = block.slug;
List.title = block.title;
