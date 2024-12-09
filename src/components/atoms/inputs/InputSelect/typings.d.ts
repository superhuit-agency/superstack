interface InputSelectOptionProps {
	label: string;
	value: string;
	disabled?: boolean;
}
interface InputSelectAttributes extends InputAttributes {
	options?: string | Array<InputSelectOptionProps>;
	placeholder?: string;
}

interface InputSelectProps
	extends Omit<React.HTMLProps<HTMLDivElement>, 'onChange'>,
		InputSelectAttributes,
		InputProps {
	value?: string;
}
