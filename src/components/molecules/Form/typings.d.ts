interface WpFormTypeRest {
	id: number;
	title: string;
	strings: any;
	fields: any;
}

interface FormAttributes extends BlockAttributes {
	id?: number; // id of the form in the backend
}

interface FormProps extends FormAttributes, BlockProps {
	fields: Array<any>;
	opt_ins: Array<any>;
	strings?: {
		[id: string]: string;
	};
}
