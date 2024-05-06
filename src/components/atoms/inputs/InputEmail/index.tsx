import cx from 'classnames';
import { FC, forwardRef, useId } from 'react';

import { useTranslation } from '@/hooks/use-translation';
import { BlockConfigs, InputProps } from '@/typings';
import block from './block.json';

// styles
import './styles.css';

/**
 * TYPINGS
 */
export type InputEmailProps = InputProps;

/**
 * COMPONENT
 */
export const InputEmail: FC<InputEmailProps> & BlockConfigs = forwardRef(
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
					'supt-input-email supt-input-wrapper supt-input-field',
					{
						'-error': invalid && typeof invalid === 'string',
						'-disabled': disabled,
					}
				)}
			>
				<label
					htmlFor={id}
					className="supt-input-email__label supt-input-field__label"
					data-optional={
						required ? '' : __t('form-input-optional', 'optional')
					}
				>
					{label}
				</label>
				<input
					id={id}
					className="supt-input-email__input supt-input-field__input"
					type="email"
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
						className="supt-input-email__error supt-input-field__error"
					>
						{invalid}
					</span>
				) : null}
			</div>
		);
	}
);

InputEmail.displayName = 'InputEmail';

InputEmail.slug = block.slug;
InputEmail.title = block.title;
