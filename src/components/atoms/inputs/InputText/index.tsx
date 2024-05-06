import { FC, forwardRef, useId } from 'react';
import cx from 'classnames';

import { useTranslation } from '@/hooks/use-translation';
import { BlockConfigs, InputProps } from '@/typings';
import block from './block.json';

// styles
import './styles.css';

/**
 * TYPINGS
 */
export type InputTextProps = InputProps;

/**
 * COMPONENT
 */
export const InputText: FC<InputTextProps> & BlockConfigs = forwardRef(
	(
		{
			id: initId,
			label,
			name,
			placeholder,
			required,
			disabled,
			invalid,
			inputAttributes,
			onChange,
			onBlur,
		},
		ref
	) => {
		const defaultId = useId();
		const id = initId ?? defaultId;

		const __t = useTranslation();

		return (
			<div
				className={cx(
					'supt-input-text supt-input-wrapper supt-input-field',
					{
						'-error': invalid && typeof invalid === 'string',
						'-disabled': disabled,
					}
				)}
			>
				<label
					htmlFor={id}
					className="supt-input-text__label supt-input-field__label"
					data-optional={
						required ? '' : __t('form-input-optional', 'optional')
					}
				>
					{label}
				</label>
				<input
					id={id}
					className="supt-input-text__input supt-input-field__input"
					type="text"
					name={name}
					placeholder={placeholder}
					required={required}
					disabled={disabled}
					ref={ref}
					aria-invalid={!!invalid}
					{...inputAttributes}
					onChange={onChange}
					onBlur={onBlur}
				/>
				{invalid && typeof invalid === 'string' ? (
					<span
						role="alert"
						className="supt-input-text__error supt-input-field__error"
					>
						{invalid}
					</span>
				) : null}
			</div>
		);
	}
);

InputText.displayName = 'InputText';

InputText.slug = block.slug;
InputText.title = block.title;
