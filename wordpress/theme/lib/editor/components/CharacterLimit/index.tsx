import React, { FC, useEffect, useMemo } from 'react';
import { _x } from '@wordpress/i18n';
import { removeHtmlTags } from '#/utils';

import './styles.css';

interface CharacterLimitProps {
	value: string;
	onChange: (value: string) => void;
	limit: number;
}

export const CharacterLimit: FC<CharacterLimitProps> = ({
	value,
	onChange,
	limit,
}) => {
	const strippedValue = useMemo(
		() => (value ? removeHtmlTags(value) : value),
		[value]
	);

	useEffect(() => {
		if (strippedValue?.length > limit) {
			// onChange(value.substring(0, limit));
			// onChange(value.substring(0, value.length - 1));

			onChange(
				value.substring(
					0,
					value.length - (strippedValue?.length - limit)
				)
			);
		}
	}, [value, onChange, strippedValue, limit]);

	return (
		<p className="supt-character-limit">
			<small>
				({strippedValue?.length ?? 0}/{limit}{' '}
				{_x('characters', 'Character limit', 'supt')})
			</small>
		</p>
	);
};
