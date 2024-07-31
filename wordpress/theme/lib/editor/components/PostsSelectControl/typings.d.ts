interface PostsSelectControlProps extends FormTokenField.Props {
	onChange: (tokens: Array<any>) => void;
	postType?: string;
	values?: Array<any>;
	label?: string;
}
