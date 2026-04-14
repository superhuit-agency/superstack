import './styles.css';

export default function Details(props: DetailsProps) {
  return (
    <details>
      <summary>{props.summary}</summary>
      {props.children}
    </details>
  );
}
