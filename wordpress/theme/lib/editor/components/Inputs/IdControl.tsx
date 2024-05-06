import React, { FC } from 'react';
import slugify from 'slugify';
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';
import { __ } from '@wordpress/i18n';
import { TextControl } from '@wordpress/components';

import { SLUGIFY_ARGS } from '@/components/atoms/inputs/constants';

const setIdDebounced = debounce((onChange, id) => {
	onChange(isEmpty(id) ? '' : slugify(id, SLUGIFY_ARGS));
}, 1000);

interface IdControlProps {
	blockId: string;
	id: string;
	name?: string;
	label?: string;
	onChange: (id: string) => void;
}

export const IdControl: FC<IdControlProps> = ({
	blockId,
	id,
	name = '',
	label = '',
	onChange,
}) => {
	const slugifiedId = `${slugify(name || label || '', {
		replacement: '_',
		lower: true,
	})}_${blockId}`;

	return (
		<TextControl
			label={__('ID')}
			help={__(
				'Define a unique ID if you need to access it by CSS or JavaScript'
			)}
			value={id}
			onChange={(value: string) => {
				onChange(value);
				setIdDebounced(onChange, value);
			}}
			placeholder={slugifiedId}
		/>
	);
};
