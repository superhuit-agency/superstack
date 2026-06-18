interface AccordionAttributes extends BlockAttributes {
	autoclose?: boolean;
}
interface AccordionProps
	extends AccordionAttributes, React.HTMLProps<HTMLDivElement> {}
