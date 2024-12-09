interface CheckboxAttributes extends Omit<InputAttributes, 'required'> {
	value?: string;
}

interface CheckboxProps extends CheckboxAttributes, InputProps {
	defaultChecked?: boolean;
}
