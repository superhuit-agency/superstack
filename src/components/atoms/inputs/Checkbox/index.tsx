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
export type CheckboxProps = InputProps & {
	value?: string;
	defaultChecked?: boolean;
};

/**
 * COMPONENT
 */
export const Checkbox: FC<CheckboxProps> & BlockConfigs = forwardRef<
	HTMLInputElement,
	CheckboxProps
>(
	(
		{
			label,
			name,
			id: initId,
			value,
			disabled = false,
			invalid,
			required,
			defaultChecked,
			inputAttributes,
			onChange,
			onBlur,
		},
		ref
	) => {
		const defaultId = useId();
		const id = initId ?? defaultId;

		// Get checkbox value
		const finalValue = useMemo(
			() => (value ? value : slugify(label, SLUGIFY_ARGS)),
			[value, label]
		);
		const finalId = useMemo(
			() => slugify(label, SLUGIFY_ARGS) + '_' + id,
			[id, label]
		);

		return (
			<div className="supt-checkbox">
				<input
					id={finalId}
					className="supt-checkbox__input"
					type="checkbox"
					name={name}
					value={finalValue}
					disabled={disabled}
					required={required}
					ref={ref}
					aria-invalid={!!invalid}
					defaultChecked={defaultChecked}
					{...inputAttributes}
					onChange={onChange}
					onBlur={onBlur}
				/>
				<label
					htmlFor={finalId}
					className="supt-checkbox__label"
					dangerouslySetInnerHTML={{ __html: label }}
				/>
			</div>
		);
	}
);

Checkbox.displayName = 'Checkbox';

Checkbox.slug = block.slug;
Checkbox.title = block.title;
