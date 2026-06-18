import block from './block.json';

// styles
import './styles.css';

export default function List({
	ordered,
	reversed,
	start,
	children,
}: ListProps) {
	return (
		<>
			{ordered ? (
				<ol
					className="supt-list"
					style={{
						counterSet: start ? `li ${start + 1}` : undefined,
					}}
					reversed={reversed}
				>
					{children}
				</ol>
			) : (
				<ul className="supt-list">{children}</ul>
			)}
		</>
	);
}

List.slug = block.slug;
List.title = block.title;
