import { FC } from 'react';

import block from './block.json';

export const ListItem: FC<ListItemProps> & BlockConfigs = ({
	content,
	children,
}) => {
	if (!content) return null;
	return (
		<li>
			<span dangerouslySetInnerHTML={{ __html: content }} />
			{children}
		</li>
	);
};

ListItem.slug = block.slug;
ListItem.title = block.title;
