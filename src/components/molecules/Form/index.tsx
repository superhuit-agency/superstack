'use client';

import React, {
	FC,
	useState,
	useRef,
	useEffect,
	ReactNode,
	useCallback,
	useId,
} from 'react';
import cx from 'classnames';
import { usePathname } from 'next/navigation';
import {
	RegisterOptions,
	useForm,
	Controller,
	SubmitHandler,
	FieldValues,
	FieldError,
	Merge,
	FieldErrorsImpl,
} from 'react-hook-form';
import HCaptcha from '@hcaptcha/react-hcaptcha';

import { useLocale } from '@/contexts/locale-context';
import {
	getAcceptValidator,
	getMaxFilesizeValidator,
	uploadFile,
} from '@/components/atoms/inputs/InputFile/helpers';
import {
	Button,
	FormSectionBreaker,
	InputEmail,
	InputFile,
	InputSelect,
	InputText,
	InputTextarea,
	InputCheckbox,
	InputRadio,
	Checkbox,
} from '@/components/atoms';
import block from './block.json';

import './styles.css';

export const Form: FC<FormProps> & BlockConfigs = ({
	fields = [],
	id,
	strings: { submitLabel = 'Send' } = {},
	optIns = [],
}) => {
	const {
		register,
		handleSubmit,
		formState,
		setError,
		clearErrors,
		control,
		getValues,
		reset,
	} = useForm({ mode: 'onSubmit', shouldFocusError: true });

	const pathname = usePathname();

	const uniqueId = useId();

	const { dictionary } = useLocale();

	const [successMessage, setSuccessMessage] = useState<string>();
	const [token, setToken] = useState<string | null>(null); // hCaptcha token

	const captchaRef = useRef<HCaptcha | null>(null);

	const { errors, isSubmitting, isSubmitSuccessful, isSubmitted } = formState;

	// Submit form data to our server
	const submitForm = useCallback(async () => {
		if (!id) return;

		const formData = new FormData();
		formData.append('id', id.toString()); // formID

		// Retrieve form input values
		const values = getValues();

		if (process.env.NEXT_PUBLIC_HCAPTCHA_KEY && token)
			formData.append('_tk', token); // hCaptcha token

		const uploadPromises: Promise<any>[] = Object.entries(values).reduce(
			(promises: Promise<any>[], [key, value]) => {
				if (value.length && value[0] instanceof File) {
					// FileList data type
					[...value].forEach((file) =>
						promises.push(uploadFile(file, key, uniqueId))
					);
				} else if (!value.length && value instanceof FileList) {
					// Send empty string if no value
					formData.append(key, '');
				}

				return promises;
			},
			[]
		);

		if (uploadPromises.length) {
			formData.append('uploadId', uniqueId);

			const uploadResults: Array<any> =
				(await Promise.all(uploadPromises).catch((e) => {
					/* console.log('Error', e) */
				})) || [];
			uploadResults.forEach((file, i) => {
				return formData.append(`${file.key}[]`, file.name);
			});
		}

		Object.entries(values).forEach(([key, value]) => {
			// Files have already been uploaded & appended
			if (typeof value !== 'object') {
				formData.append(key, value);
			} else if (Array.isArray(value) && !(value[0] instanceof File)) {
				// It's a checkbox
				formData.append(key, value.join(', '));
			}
		});

		// send form
		const res: any = await fetch(`/api/submit-form/`, {
			method: 'POST',
			body: formData,
		}).catch((e) => {
			console.error('Error on form submission', e);
		});

		const json: any = await res.json().catch((e: Event) => {
			console.error('Error on form submission response process', e);
		});

		// unhandled error
		if (res.status !== 200 && !json?.data?.errors) {
			return setError('__global', {
				message: dictionary.form?.error.message,
			});
		}

		// handled error(s)
		if (json?.data?.errors) {
			Object.keys(json.data.errors)?.forEach((name, i) => {
				const errs = json.data.errors[name];
				setError(name, {
					message: Array.isArray(errs) ? errs.join('<br>') : errs,
				});
			});
			return;
		}

		// success!
		setSuccessMessage(json?.data?.message);
		return;
	}, [getValues, setError, token, id, uniqueId, dictionary]);

	// Triggered once the form is submitted
	const onSubmit: SubmitHandler<FieldValues> = useCallback(
		async (data, e) => {
			e?.preventDefault();

			// validate hCaptcha before sending the form to avoid spams
			try {
				await (process.env.NEXT_PUBLIC_HCAPTCHA_KEY &&
				captchaRef?.current
					? captchaRef.current.execute()
					: submitForm());
			} catch (e) {
				return setError('__global', {
					message: dictionary.form?.error.message,
				});
			}
		},
		[setError, submitForm, dictionary]
	);

	// Reset form
	const resetForm = useCallback(() => {
		reset();
		setSuccessMessage('');
	}, [reset]);

	/**
	 * Gets a readable version of the error preventing a form to be submitted.
	 * @param error Error from the formState
	 * @returns a string description of the current errors, or a boolean is not description is available
	 */
	const getFormErrorMessage = function (
		error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>>
	): string | boolean {
		if (!errors) return false;
		else return error?.message?.toString() ?? false;
	};

	// Triggered once hCaptcha token changed (means it's been validated/verified)
	useEffect(() => {
		if (token) {
			submitForm();
		}
	}, [token, submitForm]);

	// Reset form when we change page
	useEffect(() => {
		resetForm();
	}, [pathname, resetForm]);

	return (
		<form
			className="supt-form"
			onSubmit={handleSubmit(onSubmit)}
			onChange={() => !!errors['__global'] && clearErrors('__global')}
			noValidate
		>
			<div className="supt-form__fields">
				{fields.map(({ block, attributes, children }, i) => {
					const attrs = {
						...(attributes as InputProps),
						inputAttributes: {
							disabled: isSubmitting || isSubmitSuccessful,
						},
						invalid: getFormErrorMessage(errors?.[attributes.name]),
					};

					const registerAttrs: RegisterOptions = {
						required: {
							value: attributes.required,
							message: dictionary.form?.error.inputEmpty,
						},
					};

					if (block === 'supt/form-section-breaker') {
						return <FormSectionBreaker key={i} {...attributes} />;
					}
					if (block === 'supt/input-text') {
						return (
							<InputText
								key={i}
								{...attrs}
								{...register(attrs.name, registerAttrs)}
							/>
						);
					}
					if (block === 'supt/input-email') {
						// add react-hook-form validation constraint
						registerAttrs.pattern = {
							value: /\S+@\S+\.\S+/,
							message: dictionary.form?.error.email,
						};
						return (
							<InputEmail
								key={i}
								{...attrs}
								{...register(attrs.name, registerAttrs)}
							/>
						);
					}
					if (block === 'supt/input-textarea') {
						return (
							<InputTextarea
								key={i}
								{...attrs}
								{...register(attrs.name, registerAttrs)}
							/>
						);
					}
					if (block === 'supt/input-select') {
						return (
							<Controller
								key={i}
								name={attrs.name}
								control={control}
								rules={registerAttrs}
								defaultValue={''}
								render={({ field, fieldState }) => {
									return (
										<InputSelect {...attrs} {...field} />
									);
								}}
							/>
						);
					}
					if (block === 'supt/input-checkbox') {
						return (
							<Controller
								control={control}
								key={i}
								defaultValue={[]}
								name={attrs.name}
								rules={registerAttrs}
								render={({ field, fieldState }) => (
									<InputCheckbox
										{...attrs}
										{...field}
										//@ts-ignore: Let the component deal with unwanted children
										options={children}
									/>
								)}
							/>
						);
					}
					if (block === 'supt/input-radio') {
						return (
							<Controller
								control={control}
								key={i}
								defaultValue={''}
								name={attrs.name}
								rules={registerAttrs}
								render={({ field, fieldState }) => (
									<InputRadio
										{...attrs}
										{...field}
										//@ts-ignore: Let the component deal with unwanted children
										options={children}
									/>
								)}
							/>
						);
					}
					if (block === 'supt/input-file') {
						registerAttrs.validate = {};
						if (
							'maxFilesize' in attrs &&
							attrs.maxFilesize &&
							typeof attrs.maxFilesize === 'number' &&
							attrs.maxFilesize > 0
						) {
							registerAttrs.validate.maxFilesize =
								getMaxFilesizeValidator(
									attrs.maxFilesize,
									dictionary.form?.error.filesize
								);
						}

						if (attrs.accept && attrs.accept !== '') {
							registerAttrs.validate.accept = getAcceptValidator(
								attrs.accept,
								dictionary.form?.error.accept
							);
						}
						return (
							<InputFile
								key={i}
								{...attrs}
								{...register(attrs.name, registerAttrs)}
							/>
						);
					}
				})}
				{process.env.NEXT_PUBLIC_HCAPTCHA_KEY ? (
					<HCaptcha
						sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_KEY}
						ref={captchaRef}
						size="invisible"
						onVerify={(token) => setToken(token)}
					/>
				) : null}
			</div>
			<div className="supt-form__footer">
				<div className="supt-form__opt-ins">
					{optIns.map((f, index) => (
						<Controller
							control={control}
							defaultValue={[]}
							key={index}
							name={f.name}
							rules={{
								required: {
									value: f.required,
									message: dictionary.form?.error.inputEmpty,
								},
							}}
							render={({ field }) => (
								<div className="supt-form__opt-in">
									<Checkbox
										{...field}
										required={f.required}
										label={f.label}
									/>

									{errors?.[f.name]?.message &&
									typeof errors?.[f.name]?.message ===
										'string' ? (
										<span
											role="alert"
											className="supt-input-checkbox__error supt-input-field__error"
										>
											{
												errors?.[f.name]
													?.message as ReactNode
											}
										</span>
									) : null}
								</div>
							)}
						/>
					))}
				</div>
				<div className="supt-form__actions">
					<Button
						type="submit"
						className={cx('supt-form__submit', {
							isSubmitting: isSubmitting,
							isSuccess: isSubmitSuccessful,
						})}
						title={
							isSubmitSuccessful
								? dictionary.form?.status.success
								: isSubmitting
									? dictionary.form?.status.pending
									: submitLabel ||
										dictionary.form?.submitLabel
						}
						disabled={
							isSubmitting ||
							isSubmitSuccessful ||
							!!Object.keys(errors).length
						}
					/>
				</div>
				<div className="supt-form__messages">
					{isSubmitted &&
					(errors?.__global?.message ||
						!!Object.keys(errors).length) ? (
						<div
							role="alert"
							className="supt-form__messages__error"
						>
							<p>
								{(errors?.__global?.message as ReactNode) ??
									dictionary.form?.error.empty}
							</p>
						</div>
					) : null}
					{isSubmitSuccessful && successMessage ? (
						<div
							role="status"
							className="supt-form__messages__success"
						>
							<p>{successMessage}</p>
						</div>
					) : null}
				</div>
			</div>
		</form>
	);
};

Form.slug = block.slug;
Form.title = block.title;
