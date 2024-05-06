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
} from 'react-hook-form';
import HCaptcha from '@hcaptcha/react-hcaptcha';

// internal
import { useTranslation } from '@/hooks/use-translation';
import {
	getAcceptValidator,
	getMaxFilesizeValidator,
	uploadFile,
} from '@/components/atoms/inputs/InputFile/helpers';
import { BlockConfigs } from '@/typings';
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

// styles
import './styles.css';

/**
 * TYPINGS
 */
export type FormProps = {
	id?: number; // id of the form in the backend
	strings?: {
		[id: string]: string;
	};
	fields: Array<any>;
	opt_ins: Array<any>;
};

/**
 * COMPONENT
 */
export const Form: FC<FormProps> & BlockConfigs = ({
	id,
	strings: { submitLabel = 'Send' } = {},
	fields = [],
	opt_ins = [],
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

	const __t = useTranslation();

	const [successMessage, setSuccessMessage] = useState<string>();
	const [token, setToken] = useState<string | null>(null); // hCaptcha token

	const captchaRef = useRef<HCaptcha | null>(null);
	const defaultErrorMessage = useRef(
		__t(
			'form-error-message',
			"There was an error and your message probably didn't get to us, sorry. Please try later or contact us directly by e-mail"
		)
	);

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
				message: defaultErrorMessage.current,
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
	}, [getValues, setError, token, id, uniqueId]);

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
					message: defaultErrorMessage.current,
				});
			}
		},
		[setError, submitForm]
	);

	// Reset form
	const resetForm = useCallback(() => {
		reset();
		setSuccessMessage('');
	}, [reset]);

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
						...attributes,
						inputAttributes: {
							disabled: isSubmitting || isSubmitSuccessful,
						},
						invalid: errors?.[attributes.name]
							? errors?.[attributes.name]?.message
							: false,
					};

					const registerAttrs: RegisterOptions = {
						required: {
							value: attributes.required,
							message: __t(
								'form-input-error-empty',
								'Please fill out this field.'
							),
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
							message: __t(
								'form-input-error-email',
								'Please enter a valid email address.'
							),
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
										options={children}
									/>
								)}
							/>
						);
					}
					if (block === 'supt/input-file') {
						registerAttrs.validate = {};
						if (attrs.maxFilesize && attrs.maxFilesize > 0) {
							registerAttrs.validate.maxFilesize =
								getMaxFilesizeValidator(
									attrs.maxFilesize,
									__t(
										'form-input-error-filesize',
										'Your file size is larger than %dMB.'
									)
								);
						}

						if (attrs.accept && attrs.accept !== '') {
							registerAttrs.validate.accept = getAcceptValidator(
								attrs.accept,
								__t(
									'form-input-error-accept',
									'Your file is invalid. Allowed files are %s.'
								)
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
					{opt_ins.map((opt_in, index) => (
						<Controller
							control={control}
							defaultValue={[]}
							key={index}
							name={opt_in.name}
							rules={{
								required: {
									value: opt_in.required,
									message: __t(
										'form-input-error-empty',
										'Please fill out this field.'
									),
								},
							}}
							render={({ field }) => (
								<div className="supt-form__opt-in">
									<Checkbox
										{...field}
										required={opt_in.required}
										label={opt_in.label}
									/>

									{errors?.[opt_in.name]?.message &&
									typeof errors?.[opt_in.name]?.message ===
										'string' ? (
										<span
											role="alert"
											className="supt-input-checkbox__error supt-input-field__error"
										>
											{
												errors?.[opt_in.name]
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
								? __t('form-status-success', 'Sent')
								: isSubmitting
									? __t('form-status-pending', 'Sending…')
									: submitLabel ||
										__t('form-submit-label', 'Submit')
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
									__t(
										'form-error-empty',
										'Please fill out the form entirely to be able to send it.'
									)}
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
