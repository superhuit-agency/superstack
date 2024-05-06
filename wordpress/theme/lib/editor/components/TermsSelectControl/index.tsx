import React from 'react';
import cx from 'classnames';

import { useMemo, useState } from '@wordpress/element';
import { FormTokenField, Spinner } from '@wordpress/components';

import { CATEGORY_TAX_NAME } from '#/constants';
import { useRestAPI } from '#/hooks';
import { escapeHTML } from '#/utils';
import { WpTermRest } from '#/typings';

import './styles.css';

// @ts-ignore
interface TermsSelectControllProps extends FormTokenField.Props {
	onChange: (tokens: Array<any>) => void;
	taxonomy?: string;
	values?: Array<any>;
	label?: string;
}

const TermsSelectControl = ({
	onChange,
	taxonomy = CATEGORY_TAX_NAME,
	values,
	...rest
}: TermsSelectControllProps) => {
	const [search, setSearch] = useState('');

	const selectedArgs = useMemo(
		() => ({
			per_page: 99,
			include: values,
			orderby: values?.length ? 'include' : undefined,
		}),
		[values]
	);
	const suggestionArgs = useMemo(() => ({ search }), [search]);

	const { isLoading: isLoadingSelected, data: selectedTerms } = useRestAPI<
		WpTermRest[]
	>(taxonomy, selectedArgs);

	const { data: suggestionTerms } = useRestAPI<WpTermRest[]>(
		taxonomy,
		suggestionArgs
	);

	const suggestions = useMemo(() => {
		return suggestionTerms?.map(({ name }) => name) ?? [];
	}, [suggestionTerms]);

	const selectedTokens = useMemo(
		() =>
			values
				?.map(
					(value) =>
						selectedTerms?.find(({ id }) => id === value)?.name ??
						null
				)
				.filter(Boolean) ?? [],
		[selectedTerms, values]
	);

	return (
		<div
			className={cx('supt-terms-select-control', {
				'-is-loading': isLoadingSelected,
			})}
		>
			<div className="supt-terms-select-control__spinner">
				<Spinner />
			</div>
			<FormTokenField
				suggestions={suggestions}
				onInputChange={setSearch}
				displayTransform={escapeHTML}
				onChange={(tokens: Array<string>) => {
					onChange(
						tokens
							.map(
								(token) =>
									[...selectedTerms, ...suggestionTerms].find(
										({ name }) => name === token
									)?.id ?? null
							)
							.filter(Boolean)
					);
					setSearch('');
				}}
				value={selectedTokens as []}
				// @ts-ignore
				__experimentalExpandOnFocus={!!search.length}
				{...rest}
			/>
		</div>
	);
};

export default TermsSelectControl;
