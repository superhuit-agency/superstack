import './styles.css';

export default function Pullquote(props: PullquoteProps) {
	return (
		<blockquote className="supt-pullquote">
			<p>{props.value}</p>
			<cite>{props.citation}</cite>
		</blockquote>
	);
}
