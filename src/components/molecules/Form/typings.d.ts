interface GraphQlFormFields {
	fields?: string;
	id: number;
	modified?: string;
	name?: string;
	optIns?: Array<FormOptIn>;
	strings?: FormStrings;
	title?: string;
}

interface GraphQlFormQuery {
	form: GraphQlFormFields;
}
interface GraphQlFormsLisResp extends Array<GraphQlFormFields> {}

interface FormAttributes extends BlockAttributes {
	id?: number; // id of the form in the backend
}

interface FormField {
	attributes: Record<string, any> & {
		name: string;
		maxFilesize?: number;
		accept?: string;
	};
	block: string;
	children?: Array<any>;
}

interface FormOptIn {
	id: string;
	label: string;
	name: string;
	required: boolean;
}

interface FormStrings {
	[id: string]: string;
}

interface FormComponentData {
	fields: Array<FormField>;
	id: number;
	name: string;
	optIns: Array<FormOptIn>;
	strings?: FormStrings;
	version: number;
}

interface FormProps extends FormComponentData, FormAttributes, BlockProps {}
