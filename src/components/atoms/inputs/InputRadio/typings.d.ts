interface InputRadioAttributes extends InputAttributes {}

interface InputRadioProps extends InputRadioAttributes, InputProps {
	options?: Array<{ attrs: RadioProps }>;
}
