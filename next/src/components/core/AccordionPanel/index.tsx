import './styles.css';

export default function AccordionPanel(props: AccordionPanelProps) {
  return (
    <div className="wp-block-accordion-panel">
      {props.children}
    </div>
  );
}
