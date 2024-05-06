import cx from 'classnames';
import { FC, forwardRef, useId } from 'react';

import { BlockConfigs, InputProps } from '@/typings';
import block from './block.json';

// styles
import { useTranslation } from '@/hooks/use-translation';
import './styles.css';

/**
 * TYPINGS
 */
export type InputTextareaProps = InputProps;

/**
 * COMPONENT
 */
export const InputTextarea: FC<InputTextareaProps> & BlockConfigs = forwardRef(
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
					'supt-input-textarea supt-input-wrapper supt-input-field',
					{
						'-error': invalid && typeof invalid === 'string',
						'-disabled': disabled,
					}
				)}
			>
				<label
					htmlFor={id}
					className="supt-input-textarea__label supt-input-field__label"
					data-optional={
						required ? '' : __t('form-input-optional', 'optional')
					}
				>
					{label}
				</label>
				<textarea
					id={id}
					className="supt-input-textarea__input supt-input-field__input"
					name={name}
					placeholder={placeholder}
					required={required}
					disabled={disabled}
					rows={4}
					ref={ref}
					aria-invalid={!!invalid}
					{...inputAttributes}
					onChange={onChange}
					onBlur={onBlur}
				/>
				{invalid && typeof invalid === 'string' ? (
					<span
						role="alert"
						className="supt-input-textarea__error supt-input-field__error"
					>
						{invalid}
					</span>
				) : null}
			</div>
		);
	}
);

InputTextarea.displayName = 'InputTextarea';

InputTextarea.slug = block.slug;
InputTextarea.title = block.title;
