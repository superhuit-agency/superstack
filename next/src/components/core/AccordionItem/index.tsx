import './styles.css';

export default function AccordionItem({
	openByDefault,
	children,
}: AccordionItemProps) {
	return (
		<details className="wp-block-accordion-item" open={openByDefault}>
			{children}
		</details>
	);
}
