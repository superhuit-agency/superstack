import { FC, forwardRef, useId, useMemo } from 'react';
import slugify from 'slugify';

// internal imports
import { SLUGIFY_ARGS } from '@/components/atoms/inputs/constants';
import { BlockConfigs, InputProps } from '@/typings';

import block from './block.json';

// styles
import './styles.css';

/**
 * TYPINGS
 */
export type RadioProps = InputProps & {
	value: string;
	defaultChecked?: boolean;
	onChange?: Function;
	onBlur?: Function;
};

/**
 * COMPONENT
 */
export const Radio: FC<RadioProps> & BlockConfigs = forwardRef(
	(
		{
			id: initId,
			label,
			name,
			value,
			disabled = false,
			required,
			defaultChecked,
			inputAttributes,
			onChange = () => {},
			onBlur = () => {},
		},
		ref
	) => {
		const defaultId = useId();
		const id = initId ?? defaultId;

		// Get radio final values
		const finalValue = useMemo(
			() => (value ? value : slugify(label, SLUGIFY_ARGS)),
			[value, label]
		);
		const finalId = useMemo(
			() => slugify(label, SLUGIFY_ARGS) + '_' + id,
			[id, label]
		);

		return (
			<div className="supt-radio">
				<input
					id={finalId}
					className="supt-radio__input"
					type="radio"
					name={name}
					value={finalValue}
					disabled={disabled}
					required={required}
					ref={ref}
					defaultChecked={defaultChecked}
					onChange={onChange}
					onBlur={onBlur}
					{...inputAttributes}
				/>
				<label htmlFor={finalId} className="supt-radio__label">
					{label}
				</label>
			</div>
		);
	}
);

Radio.displayName = 'Radio';

Radio.slug = block.slug;
Radio.title = block.title;
