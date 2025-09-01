import React, { FC, useEffect, useMemo } from 'react';
import { _x } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';
import { RichTextWithLimitProps } from './typings';
import { removeHtmlTags } from '#/utils';

import './styles.css';

export const RichTextWithLimit: FC<RichTextWithLimitProps> = ({
	value,
	onChange,
	limit,
	...props
}) => {
	const strippedValue = useMemo(
		() => (value ? removeHtmlTags(value) : value),
		[value]
	);

	useEffect(() => {
		if (value && strippedValue && strippedValue?.length > limit) {
			onChange(
				value.substring(
					0,
					value.length - (strippedValue?.length - limit)
				)
			);
		}
	}, [value, onChange, strippedValue, limit]);

	return (
		<div className="supt-rich-text-with-limit">
			<RichText {...props} value={value} onChange={onChange} />
			<p className="supt-rich-text-with-limit__counter">
				<small>
					({strippedValue?.length ?? 0}/{limit}{' '}
					{_x('characters', 'RichText with limit', 'supt')})
				</small>
			</p>
		</div>
	);
};
