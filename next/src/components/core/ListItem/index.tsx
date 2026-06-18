import block from './block.json';

export default function ListItem({ content, children }: ListItemProps) {
	if (!content) return null;
	return (
		<li>
			<span dangerouslySetInnerHTML={{ __html: content }} />
			{children}
		</li>
	);
}

ListItem.slug = block.slug;
ListItem.title = block.title;
