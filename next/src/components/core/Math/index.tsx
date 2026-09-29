import './styles.css';

export default function Math(props: MathProps) {
	return (
		<div
			className="wp-block-math"
			dangerouslySetInnerHTML={{ __html: props.mathML }}
		/>
	);
}
