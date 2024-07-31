interface InputCheckboxAttributes extends InputAttributes {
	options: Array<{ attrs: CheckboxProps }>;
}

interface InputCheckboxProps extends InputCheckboxAttributes, InputProps {
	value?: Array<string>;
}
