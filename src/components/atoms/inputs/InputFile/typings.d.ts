interface InputFileAttributes extends InputAttributes {
	accept?: string;
	description?: string;
	maxFilesize?: number;
	nbFiles?: number;
}

interface InputFileProps extends InputProps, InputFileAttributes {}
