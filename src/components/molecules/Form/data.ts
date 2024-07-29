import { gql } from '@/utils';

import block from './block.json';

// Export block slug for identification
export const slug = block.slug;

const isValidData = (data: GraphQlFormFields) =>
	!!data && typeof data === 'object' && 'fields' in data && 'name' in data;

/**
 * Dynamic data formatter/parser.
 *
 * @param {object}     data      Data from GraphQL query response
 * @param {boolean} isEditor  Wheter the formatter function is being called within the WP block editor.
 * @returns {FormComponentData}             The transformed/formatted/parsed data
 */
export const formatter = (
	data: GraphQlFormFields,
	isEditor = false
): FormComponentData => {
	if (!isValidData(data)) throw new Error('Invalid form data');

	return {
		fields: JSON.parse(data.fields!),
		id: data.id,
		name: data.name!,
		optIns: data?.optIns ?? [],
		strings: data?.strings ?? {},
		version: data.modified ? Date.parse(data.modified) : 0,
	};
};

/**
 * GraphQL data fetching.
 * Should return the final props needed for the block
 *
 * @param {Function} fetcher    The context based function to request the GraphQl endpoint.
 *                              Arguments: - {string} query, [{any} variables].
 * @param {any}      attrs      The attributes of the block
 * @param {boolean}  isEditor   Wheter the context is within the WP block editor.
 */
export const getData = async (
	fetcher: FetchApiFuncType,
	attrs: any = null,
	isEditor: boolean = false
): Promise<FormComponentData> => {
	const query = gql`
		query formQuey($id: ID!) {
			form(id: $id, idType: DATABASE_ID) {
				id: databaseId
				name: slug
				modified
				fields
				optIns {
					id
					label
					name
					required
				}
				strings {
					submitLabel
				}
			}
		}
	`;

	if (!attrs?.id) return {} as FormComponentData;

	const options = { variables: { id: attrs.id } };
	const data = await fetcher(query, options);

	return formatter(data?.form, isEditor);
};

/**
 *
 * @param fetcher
 * @param attrs
 * @param isEditor
 * @returns
 */
export const getFormsList = async (
	fetcher: FetchApiFuncType,
	attrs: any = null,
	isEditor: boolean = false
): Promise<GraphQlFormsLisResp> => {
	const query = gql`
		query formListQuery {
			forms {
				nodes {
					id: databaseId
					title
				}
			}
		}
	`;

	const data = await fetcher(query);

	return data?.forms?.nodes ?? [];
};
