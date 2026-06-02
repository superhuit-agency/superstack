import './styles.css';

export default function Accordion(props: AccordionProps) {
  return (
    <div className="wp-block-accordion">
      {props.children}
    </div>
  );
}
