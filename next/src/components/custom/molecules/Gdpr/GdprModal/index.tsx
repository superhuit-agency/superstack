import {
	forwardRef,
	MouseEvent,
	Ref,
	useCallback,
	useEffect,
	useId,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import cx from 'classnames';

import Button from '@/components/core/Button';
import { useLocale } from '@/contexts/locale-context';

import { type GdprCategoryType } from '../consent';
import { GdprCategory, type GdprCategoryHandle } from '../GdprCategory';

import './styles.css';

/**
 * TYPINGS
 */
export interface GdprModalProps {
	categories: GdprCategoryType[];
	onCategoryChange: (param: { enabled: boolean; id: string }) => void;
	onModalSaved: () => void;
	onModalClosed: () => void;
}

export interface GdprModalHandle {
	open: () => void;
	setCategoryEnabled: (category: GdprCategoryType, enabled: boolean) => void;
}

/**
 * COMPONENT
 */
export const GdprModal = forwardRef(
	(
		{
			categories,
			onModalSaved,
			onModalClosed,
			onCategoryChange,
		}: GdprModalProps,
		ref: Ref<GdprModalHandle>
	) => {
		const [isHidden, setIsHidden] = useState(true);
		const [isUnmounting, setIsUnmounting] = useState(false);

		const elRef = useRef<HTMLElement>(null);
		const dialogRef = useRef<HTMLDivElement>(null);

		const categoriesRef = useRef<GdprCategoryHandle[]>([]);
		const id = useId();

		const { dictionary } = useLocale();

		// ##############################
		// #region Event handler
		// ##############################

		const close = useCallback(() => {
			if (isHidden === true) return;

			setIsHidden(true);
			onModalClosed();
		}, [onModalClosed, isHidden]);

		const save = useCallback(() => {
			onModalSaved();
			close();
		}, [close, onModalSaved]);

		const onAnimationEnd = useCallback(() => {
			close();
			setIsUnmounting(false);
		}, [close]);

		const onSave = useCallback(
			(event: MouseEvent) => {
				event.stopPropagation();
				save();
			},
			[save]
		);

		const onClose = useCallback(
			(event: MouseEvent | Event) => {
				event.stopPropagation();
				setIsUnmounting(true);

				window.setTimeout(() => {
					onAnimationEnd();
				}, 300);
			},
			[onAnimationEnd]
		);

		// ##############################
		// #endregion
		// ##############################

		const open = useCallback(() => {
			if (isHidden === false) return;

			setIsHidden(false);
		}, [isHidden]);

		const setCategoryEnabled = useCallback(
			(category: GdprCategoryType, enabled = false) => {
				categoriesRef.current
					?.find((cat) => cat.getId() === category.id)
					?.setEnabled(enabled);
			},
			[]
		);

		// Allows to call these functions from the parent
		useImperativeHandle(ref, () => ({
			open,
			setCategoryEnabled,
		}));

		useEffect(() => {
			const closeOnOutsideClick = (e: Event) => {
				if (isHidden) return;
				if (dialogRef.current?.contains(e.target as Node)) return;
				onClose(e);
			};

			const target = elRef.current;

			if (!isHidden) {
				target?.addEventListener('click', closeOnOutsideClick);
				// Disable scroll on body
				document.body.style.overflow = 'hidden';
			}
			return () => {
				target?.removeEventListener('click', closeOnOutsideClick);
				// Enable scroll on body
				document.body.style.overflow = '';
			};
		}, [isHidden, onClose]);

		return (
			<section
				className={cx('supt-gdpr-modal', {
					'-fade-out': isUnmounting,
				})}
				role="dialog"
				aria-modal="true"
				aria-hidden={isHidden}
				aria-labelledby="cookie-law-modal:title"
				tabIndex={-1}
				id={id}
				ref={elRef}
			>
				<div
					className="supt-gdpr-modal__dialog"
					role="document"
					ref={dialogRef}
				>
					<div className="supt-gdpr-modal__content">
						<header className="supt-gdpr-modal__head">
							<p
								id="cookie-law-modal:title"
								className="supt-gdpr-modal__title"
							>
								{dictionary.gdpr.modal.title}
							</p>
						</header>
						<div className="supt-gdpr-modal__body">
							<p className="supt-gdpr-modal__body__text">
								{dictionary.gdpr.modal.description}
							</p>
							<ul className="supt-gdpr-modal__categories">
								{categories.map((cat, index) => (
									<GdprCategory
										key={cat.id}
										cat={cat}
										handleChange={onCategoryChange}
										ref={(categoryRef) => {
											if (categoryRef) {
												categoriesRef.current[index] =
													categoryRef;
											}
										}}
									/>
								))}
							</ul>
							<footer className="supt-gdpr-modal__footer">
								<Button
									text={dictionary.gdpr.modal.save}
									className="supt-gdpr-modal__save-button"
									onClick={onSave}
								/>
							</footer>
						</div>
					</div>
				</div>
			</section>
		);
	}
);

GdprModal.displayName = 'GdprModal';
