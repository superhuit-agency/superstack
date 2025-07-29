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

/**
 * Description of a form field, typically any HTML Input element.
 */
interface FormField {
	attributes: Record<string, any> & {
		name: string;
		maxFilesize?: number;
		accept?: string;
		// Add more attributes here when needed...
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

interface FormComponentData extends BlockAttributes {
	id: number;
	strings?: FormStrings;
}

interface FormProps extends FormComponentData, BlockProps {
	name: string;
	optIns: Array<FormOptIn>;
	fields: Array<FormField>;
	version: number;
}
