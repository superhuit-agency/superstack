import './styles.css';

export default function AccordionHeading({ title }: AccordionHeadingProps) {
	return <summary className="wp-block-accordion-heading">{title}</summary>;
}
