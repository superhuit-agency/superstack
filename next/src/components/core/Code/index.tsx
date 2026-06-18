import './styles.css';

export default function Code(props: CodeProps) {
	if (!props.content) return null;

	return (
		<pre>
			<code>{props.content}</code>
		</pre>
	);
}
