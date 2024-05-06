'use client';

import cx from 'classnames';
import dynamic from 'next/dynamic';
import {
	FC,
	forwardRef,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useState,
} from 'react';

// internal imports
import { useTranslation } from '@/hooks/use-translation';
import { BlockConfigs, InputProps } from '@/typings';
import block from './block.json';

// styles
import './styles.css';

const Select = dynamic(() => import('react-select'));

/**
 * TYPINGS
 */
type OptionProps = {
	label: string;
	value: string;
	disabled?: boolean;
};

const isOptionProps = (value: unknown): value is OptionProps => {
	return (
		typeof value === 'object' &&
		value !== null &&
		'label' in value &&
		'value' in value
	);
};

export type InputSelectProps = InputProps & {
	options: string | Array<OptionProps>;
	onChange?: Function;
	onBlur?: Function;
	value?: string;
};

/**
 * Build an options array from string. Format: `value:label;value:label;....`
 *
 * 1. Split by semicolon
 * 2. Trim white spaces
 * 3. Get value and label
 * 4. Create Array with values
 *
 * @param {string} options
 * @returns {Array<OptionProps>}
 */
const buildOptionsFromString = (options: string) =>
	options.split(';').reduce((acc, element) => {
		const trimmedElement = element.trim().replace('::', ':'); // Remove white spaces + fix duplicate separators

		if (trimmedElement) {
			const [value, label] = trimmedElement.split(':');
			acc.push({
				label: label.trim(),
				value: value.trim(),
			});
		}
		return acc;
	}, [] as OptionProps[]);

/**
 * COMPONENT
 */
export const InputSelect: FC<InputSelectProps> & BlockConfigs = forwardRef(
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
			options: initOptions,
			onChange,
			onBlur,
			value,
			...rest
		}: InputSelectProps,
		ref: React.Ref<HTMLInputElement>
	) => {
		const defaultId = useId();
		const id = initId ?? defaultId;

		const __t = useTranslation();
		const labelId = useId();

		const options = useMemo(
			() =>
				Array.isArray(initOptions)
					? initOptions
					: buildOptionsFromString(initOptions),
			[initOptions]
		);

		const [selectedOption, setSelectedOption] =
			useState<OptionProps | null>(null);

		useEffect(() => {
			setSelectedOption(
				options.find((opt) => opt.value === value) ?? null
			);
		}, [options, value]);

		useEffect(() => {
			if (selectedOption) {
				onChange?.(selectedOption.value);
			}
		}, [onChange, selectedOption]);

		const onSelectionChange = useCallback((selectedOption: unknown) => {
			if (isOptionProps(selectedOption)) {
				setSelectedOption(selectedOption);
			}
		}, []);

		return (
			<div
				className={cx(
					'supt-input-select supt-input-wrapper supt-input-field',
					{
						'-error': invalid && typeof invalid === 'string',
						'-disabled': disabled,
					}
				)}
				{...rest}
			>
				<label
					htmlFor={id}
					className="supt-input-select__label supt-input-field__label"
					id={labelId}
					data-optional={
						required ? '' : __t('form-input-optional', 'optional')
					}
				>
					{label}
				</label>
				<Select
					// inputRef={ref}
					styles={{
						indicatorSeparator: () => ({
							display: 'none',
						}),
					}}
					components={{
						DropdownIndicator: () => (
							<svg viewBox="0 0 13 8" width="13" height="8">
								<path
									fill="none"
									fillRule="evenodd"
									stroke="#0D2743"
									strokeWidth="1.6"
									d="m11.5 1.5-5 5-5-5"
								/>
							</svg>
						),
					}}
					aria-labelledby={labelId}
					inputId={id}
					classNamePrefix="supt-input-select"
					className="supt-input-select__input supt-input-field__input"
					onChange={onSelectionChange}
					isDisabled={!!inputAttributes?.disabled}
					isSearchable={true}
					name={name}
					placeholder={placeholder}
					options={options}
					isOptionDisabled={(opt) =>
						(opt as OptionProps)?.disabled ?? false
					}
					aria-invalid={!!invalid}
					onBlur={onBlur}
					value={selectedOption}
				/>
				{invalid && typeof invalid === 'string' ? (
					<span
						role="alert"
						className="supt-input-select__error supt-input-field__error"
					>
						{invalid}
					</span>
				) : null}
			</div>
		);
	}
);

InputSelect.displayName = 'InputSelect';

InputSelect.slug = block.slug;
InputSelect.title = block.title;
