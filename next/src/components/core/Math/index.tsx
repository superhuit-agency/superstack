import './styles.css';

export default function Math(props: MathProps) {
  return (
    <div
      className="supt-math"
      dangerouslySetInnerHTML={{ __html: props.mathML }}
    />
  );
}
