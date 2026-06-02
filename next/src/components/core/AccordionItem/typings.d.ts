interface AccordionItemAttributes extends BlockAttributes {
  openByDefault?: boolean;
}
interface AccordionItemProps extends AccordionItemAttributes {
  children: React.ReactNode;
}
