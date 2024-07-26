interface RadioAttributes extends Omit<InputAttributes, 'required'> {
	value?: string;
}

interface RadioProps extends RadioAttributes, InputProps {
	defaultChecked?: boolean;
}
