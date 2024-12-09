interface InputAttributes {
	id?: string;
	label?: string;
	name?: string;
	required?: boolean;
}

interface InputProps
	extends Omit<React.HTMLProps<HTMLInputElement>, 'onChange'>,
		InputAttributes {
	invalid?: boolean | string;
	inputAttributes?: HTMLAttributes<HTMLInputElement>;
	name: string;
	onChange?: Function;
}
