import React, { FC } from 'react';
import slugify from 'slugify';
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';
import { __ } from '@wordpress/i18n';
import { TextControl } from '@wordpress/components';

import { SLUGIFY_ARGS } from '@/components/atoms/inputs/constants';

const setNameDebounced = debounce((onChange, name) => {
	onChange(isEmpty(name) ? '' : slugify(name, SLUGIFY_ARGS));
}, 1000);

interface NameControlProps {
	name: string;
	placeholder?: string;
	onChange: (name: string) => void;
}

export const NameControl: FC<NameControlProps> = ({
	name,
	placeholder = '',
	onChange,
}) => {
	const slugifiedName = slugify(name || placeholder || '', SLUGIFY_ARGS);
	const emailSnippet = (
		<code style={{ fontSize: '.9em' }}>
			{'{{'}&nbsp;
			<span style={{ wordBreak: 'break-word' }}>{slugifiedName}</span>
			&nbsp;{'}}'}
		</code>
	);

	return (
		<>
			<TextControl
				label={__('Name', 'supt')}
				value={name}
				onChange={(value: string) => {
					onChange(value);
					setNameDebounced(onChange, value);
				}}
				placeholder={slugifiedName}
				help={
					<>
						<strong>
							{__('This name has to be unique.', 'supt')}
						</strong>
						<br />
						{slugifiedName ? (
							<>
								{__(
									'Show this field in the email with: ',
									'supt'
								)}{' '}
								{emailSnippet}
							</>
						) : null}
					</>
				}
			/>
		</>
	);
};
