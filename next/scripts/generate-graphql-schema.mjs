/**
 * Writes the schema of the WordPress at WORDPRESS_URL (next/.env) to
 * `schema.graphql`, the snapshot the GraphQL types are generated from
 * (`npm run generate:types`, see codegen.ts).
 *
 * Read by introspection over HTTP, as the Next app reads WordPress: the local
 * provisioning enables public introspection. `wp graphql
 * generate-static-schema` can't replace it, since wp-graphql-polylang
 * registers its types in HTTP GraphQL requests only, and the command fails
 * once the multilang plugins are active.
 */
import { writeFile } from 'node:fs/promises';
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql';

const url = `${process.env.WORDPRESS_URL ?? 'http://localhost'}/graphql`;
const output = new URL('../schema.graphql', import.meta.url);

const res = await fetch(url, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({
		query: getIntrospectionQuery({ inputValueDeprecation: true }),
	}),
});

const text = await res.text();
let json;
try {
	json = JSON.parse(text);
} catch {
	throw new Error(
		`${url} answered ${res.status} without JSON: ${text.slice(0, 300)}`
	);
}

if (!json.data?.__schema) {
	throw new Error(
		`${url} returned no schema. Is public introspection enabled (GraphQL › Settings)?\n${JSON.stringify(json.errors ?? json, null, 2)}`
	);
}

await writeFile(output, `${printSchema(buildClientSchema(json.data))}\n`);
console.log(`Schema of ${url} written to schema.graphql`);
