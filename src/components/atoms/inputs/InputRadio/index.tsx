import cx from 'classnames';
import { FC, forwardRef, Ref, useId } from 'react';
// internal imports
import { useTranslation } from '@/hooks/use-translation';
import { BlockConfigs, InputProps } from '@/typings';
import { Radio, RadioProps } from '../Radio';
import block from './block.json';
// styles
import './styles.css';

/**
 * TYPINGS
 */
export type InputRadioProps = InputProps & {
	onChange?: Function;
	onBlur?: Function;
	options: Array<{ attrs: RadioProps }>;
};

/**
 * COMPONENT
 */
export const InputRadio: FC<InputRadioProps> & BlockConfigs = forwardRef<
	HTMLInputElement,
	InputRadioProps
>(
	(
		{
			id: initId,
			label,
			name,
			disabled,
			required,
			invalid,
			options,
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
			<fieldset
				className={cx(
					'supt-input-radio supt-input-wrapper supt-input-field',
					{
						'-error': invalid && typeof invalid === 'string',
						'-disabled': disabled,
						'-single': options.length === 1,
					}
				)}
			>
				{label ? (
					<legend
						className="supt-input-field__label supt-input-radio__label"
						data-optional={
							required
								? ''
								: __t('form-input-optional', 'optional')
						}
					>
						{label}
					</legend>
				) : null}

				<div className="supt-input-radio__wrapper">
					{options?.map((radio, index) => (
						<Radio
							key={index}
							{...radio.attrs}
							name={name}
							id={id}
							invalid={invalid}
							required={required}
							ref={ref}
							onChange={onChange}
							onBlur={onBlur}
							inputAttributes={inputAttributes}
							disabled={disabled}
						/>
					))}
				</div>

				{invalid && typeof invalid === 'string' ? (
					<span
						role="alert"
						className="supt-input-radio__error supt-input-field__error"
					>
						{invalid}
					</span>
				) : null}
			</fieldset>
		);
	}
);

InputRadio.displayName = 'InputRadio';

InputRadio.slug = block.slug;
InputRadio.title = block.title;
