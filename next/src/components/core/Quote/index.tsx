import block from './block.json';
import './styles.css';

export default function Quote(props: QuoteProps) {
	return (
		<blockquote className="wp-block-quote">
			{props.children}
			<cite>{props.citation}</cite>
		</blockquote>
	);
}

Quote.slug = block.slug;
Quote.title = block.title;
