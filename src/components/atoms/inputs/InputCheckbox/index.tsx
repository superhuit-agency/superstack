'use client';

import cx from 'classnames';
import {
	ChangeEvent,
	FC,
	forwardRef,
	useCallback,
	useId,
	useState,
} from 'react';

import { useTranslation } from '@/hooks/use-translation';
import { BlockConfigs, InputProps } from '@/typings';

import { Checkbox, CheckboxProps } from '../Checkbox';
import block from './block.json';

// styles
import './styles.css';

/**
 * TYPINGS
 */
export type InputCheckboxProps = InputProps & {
	title?: string;
	// CHANGE: rename children to options as children is a reserved keyword in react-dom making the storybook fail
	options: Array<{ attrs: CheckboxProps }>;
	value?: Array<string>;
};

/**
 * COMPONENT
 */
export const InputCheckbox: FC<InputCheckboxProps> & BlockConfigs = forwardRef(
	(
		{
			id: initId,
			label,
			name,
			required,
			disabled,
			invalid,
			options,
			inputAttributes,
			onChange,
			onBlur,
			value,
		},
		ref
	) => {
		const defaultId = useId();
		const id = initId ?? defaultId;

		const __t = useTranslation();

		// Keep a local state of the checked items
		const [checkedItems, setCheckedItems] = useState<string[]>(value ?? []);
		const handleOnCheckboxChange = useCallback(
			({ target }: ChangeEvent<HTMLInputElement>) => {
				const newChecked = checkedItems?.includes(target.value)
					? checkedItems?.filter((id) => id !== target.value)
					: [...(checkedItems ?? []), target.value];

				setCheckedItems(newChecked);
				onChange?.(newChecked);
			},
			[onChange, checkedItems]
		);

		return (
			<fieldset
				className={cx(
					'supt-input-checkbox supt-input-wrapper supt-input-field',
					{
						'-error': invalid && typeof invalid === 'string',
						'-disabled': disabled,
						'-single': options.length === 1,
					}
				)}
			>
				{label ? (
					<legend
						className="supt-input-field__label supt-input-checkbox__label"
						data-optional={
							required
								? ''
								: __t('form-input-optional', 'optional')
						}
					>
						{label}
					</legend>
				) : null}

				<div className="supt-input-checkbox__wrapper" ref={ref}>
					{options?.map((checkbox, index) => (
						<Checkbox
							key={index}
							{...checkbox.attrs}
							name={name}
							id={id}
							invalid={invalid}
							required={required}
							disabled={disabled}
							inputAttributes={inputAttributes}
							onChange={handleOnCheckboxChange}
							onBlur={onBlur}
						/>
					))}
				</div>

				{invalid && typeof invalid === 'string' ? (
					<span
						role="alert"
						className="supt-input-checkbox__error supt-input-field__error"
					>
						{invalid}
					</span>
				) : null}
			</fieldset>
		);
	}
);

InputCheckbox.displayName = 'InputCheckbox';

InputCheckbox.slug = block.slug;
InputCheckbox.title = block.title;
