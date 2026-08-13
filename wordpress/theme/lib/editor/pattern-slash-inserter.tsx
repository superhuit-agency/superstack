/**
 * Adds the theme patterns to the "/" slash inserter of the block editor.
 *
 * Core's slash inserter only lists block types (and synced patterns), so theme
 * patterns registered from `patterns/*.php` are only reachable through the
 * inserter's "Patterns" tab. Since a single completer can be active per trigger
 * prefix, the core `blocks` completer is wrapped here to append the matching
 * patterns to its results.
 */
import React from 'react';

import { cloneBlock } from '@wordpress/blocks';
import { Icon } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';

type Pattern = {
	name: string;
	title: string;
	description?: string;
	keywords?: string[];
	categories?: string[];
	blockTypes?: string[];
	blocks: any[];
};

type CompleterOption = {
	key: string;
	value: any;
	label: any;
	isDisabled?: boolean;
};

type Completer = {
	name: string;
	useItems: (filterValue: string) => [CompleterOption[]];
	getOptionCompletion: (value: any) => any;
	[key: string]: any;
};

const MAX_PATTERNS = 6;

/**
 * Page level patterns (`Block Types: core/post-content`) are starter contents
 * meant to fill a whole page, not to be dropped in the middle of one.
 */
const EXCLUDED_BLOCK_TYPE = 'core/post-content';

/**
 * Same glyph as the `symbol` icon of `@wordpress/icons`, inlined since that
 * package is not part of the externalized WordPress libraries.
 */
const patternIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24">
		<path d="M21.3 10.8l-5.6-5.6c-.7-.7-1.8-.7-2.5 0l-5.6 5.6c-.7.7-.7 1.8 0 2.5l5.6 5.6c.3.3.8.5 1.2.5s.9-.2 1.2-.5l5.6-5.6c.8-.7.8-1.9.1-2.5zm-1 1.4l-5.6 5.6c-.1.1-.3.1-.4 0l-5.6-5.6c-.1-.1-.1-.3 0-.4l5.6-5.6s.1-.1.2-.1.1 0 .2.1l5.6 5.6c.1.1.1.3 0 .4zm-16.6-.4L10 5.5l-1-1-6.3 6.3c-.7.7-.7 1.8 0 2.5L9 19.5l1.1-1.1-6.3-6.3c-.2 0-.2-.2-.1-.3z" />
	</svg>
);

const normalize = (value: string) =>
	value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');

const matchesTerms = (pattern: Pattern, terms: string[]) => {
	const haystack = normalize(
		[
			pattern.title,
			pattern.description ?? '',
			...(pattern.keywords ?? []),
			...(pattern.categories ?? []),
		].join(' ')
	);
	return terms.every((term) => haystack.includes(term));
};

/**
 * Marks the option values handled by this completer, so `getOptionCompletion`
 * can tell a pattern apart from a regular inserter item.
 */
const patternOptionValues = new WeakSet<Pattern>();

const isPatternOption = (value: any): value is Pattern =>
	!!value && typeof value === 'object' && patternOptionValues.has(value);

const EMPTY_PATTERNS: Pattern[] = [];

function usePatternOptions(filterValue: string): CompleterOption[] {
	const terms = useMemo(
		() => normalize(filterValue).split(/\s+/).filter(Boolean),
		[filterValue]
	);

	const patterns = useSelect(
		(select) => {
			// Nothing typed yet: keep the default list of blocks untouched.
			if (!terms.length) return EMPTY_PATTERNS;

			const store: any = select('core/block-editor');
			const selectedClientId = store.getSelectedBlockClientId();
			const rootClientId = selectedClientId
				? store.getBlockRootClientId(selectedClientId)
				: null;

			const allowed: Pattern[] =
				store.__experimentalGetAllowedPatterns(rootClientId) ?? [];

			return allowed
				.filter(
					(pattern) =>
						!pattern.blockTypes?.includes(EXCLUDED_BLOCK_TYPE)
				)
				.filter((pattern) => matchesTerms(pattern, terms))
				.slice(0, MAX_PATTERNS);
		},
		[terms]
	) as Pattern[];

	return useMemo(
		() =>
			patterns.map((pattern) => {
				patternOptionValues.add(pattern);

				return {
					key: `supt-pattern-${pattern.name}`,
					value: pattern,
					label: (
						<>
							<Icon key="icon" icon={patternIcon} />
							{pattern.title}
						</>
					),
				};
			}),
		[patterns]
	);
}

const withPatterns = (completer: Completer): Completer => ({
	...completer,
	useItems(filterValue: string) {
		const [blockOptions] = completer.useItems(filterValue);
		const patternOptions = usePatternOptions(filterValue);

		// A new array on every render would loop the Autocomplete's
		// `onChangeOptions` state update, so keep the reference stable.
		const options = useMemo(
			() => [...blockOptions, ...patternOptions],
			[blockOptions, patternOptions]
		);

		return [options];
	},
	getOptionCompletion(value: any) {
		if (!isPatternOption(value))
			return completer.getOptionCompletion(value);

		return {
			action: 'replace',
			value: value.blocks.map((block) => cloneBlock(block)),
		};
	},
});

addFilter(
	'editor.Autocomplete.completers',
	'supt/pattern-slash-inserter',
	(completers: Completer[]) =>
		completers.map((completer) =>
			completer.name === 'blocks' ? withPatterns(completer) : completer
		)
);
