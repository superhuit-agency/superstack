import { parse } from 'graphql';
import { print } from 'graphql/language/printer';

/**
 * Remove duplicated fragments from the GraphQL query
 *
 * @param   {string} query The GraphQL query string
 * @returns {string}
 *
 * @see https://github.com/dotansimha/graphql-code-generator/issues/3063#issuecomment-771179054
 */
export const dedupeFragments = (query: string): string => {
	const ast = parse(query);

	const seen: string[] = [];

	const newDefinitions = ast.definitions.filter((def) => {
		if (def.kind !== 'FragmentDefinition') {
			return true;
		}

		const id = `${def.name.value}-${def.typeCondition.name.value}`;
		const haveSeen = seen.includes(id);

		seen.push(id);

		return !haveSeen;
	});

	const newAst = {
		...ast,
		definitions: newDefinitions,
	};

	return print(newAst);
};
