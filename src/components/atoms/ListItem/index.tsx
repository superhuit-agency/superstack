import { FC, HTMLProps } from 'react';
import { BlockConfigs } from '@/typings';
import block from './block.json';

/**
 * TYPINGS
 */
interface ListItemProps extends HTMLProps<HTMLLIElement> {
	content: string;
}

/**
 * COMPONENT
 */
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
