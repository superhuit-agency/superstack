import {
	ChangeEvent,
	forwardRef,
	MouseEvent,
	Ref,
	useCallback,
	useEffect,
	useImperativeHandle,
	useState,
} from 'react';
import cx from 'classnames';

import { useLocale } from '@/contexts/locale-context';

import { type GdprCategoryType } from '../consent';

import './styles.css';

/**
 * TYPINGS
 */
interface GdprCategoryProps {
	cat: GdprCategoryType;
	handleChange: (param: { enabled: boolean; id: string }) => void;
}

export interface GdprCategoryHandle {
	getId: () => string;
	setEnabled: (enabled?: boolean) => void;
}

/**
 * COMPONENT
 */
export const GdprCategory = forwardRef(
	(
		{ cat, handleChange }: GdprCategoryProps,
		ref: Ref<GdprCategoryHandle>
	) => {
		const [isCollapsed, setIsCollapsed] = useState(true);
		const [isEnabled, setIsEnabled] = useState(cat.enabled);

		const { dictionary } = useLocale();

		useEffect(() => {
			handleChange({
				enabled: isEnabled || false,
				id: cat.id,
			});
		}, [isEnabled, cat.id, handleChange]);

		// ##############################
		// #region Event handler
		// ##############################

		const onToggle = useCallback(
			(event: MouseEvent) => {
				event.stopPropagation();

				setIsCollapsed(!isCollapsed);
			},
			[setIsCollapsed, isCollapsed]
		);

		const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
			event.stopPropagation();

			setIsEnabled(event.target.checked);
		}, []);

		const stopPropagation = useCallback((event: MouseEvent) => {
			event.stopPropagation();
		}, []);

		// ##############################
		// #endregion
		// ##############################

		const getId = useCallback(() => {
			return cat.id;
		}, [cat]);

		const setEnabled = useCallback(
			(enabled = false) => {
				if (cat.mandatory) return;
				setIsEnabled(enabled);
			},
			[setIsEnabled, cat]
		);

		// Allows to call these functions from the parent
		useImperativeHandle(ref, () => ({
			getId,
			setEnabled,
		}));

		const texts = dictionary.gdpr.categories[cat.id];

		return (
			<li
				className={cx('supt-gdpr-category', {
					'-is-expanded': !isCollapsed,
				})}
			>
				<div className="supt-gdpr-category__tab" onClick={onToggle}>
					<button
						className="supt-gdpr-category__title"
						aria-label={texts.title}
						aria-expanded={!isCollapsed}
					>
						<svg
							className="supt-gdpr-category__icon"
							xmlns="http://www.w3.org/2000/svg"
							width="5"
							height="7"
							viewBox="0 0 5 7"
							fill="none"
							aria-hidden="true"
						>
							<path
								d="M4.55405 4.16562L1.63324 6.55538C0.980307 7.08959 5.53656e-08 6.62505 9.22416e-08 5.78142L3.01161e-07 1.00191C3.38037e-07 0.158279 0.980306 -0.306269 1.63324 0.227947L4.55405 2.61771C5.04307 3.01781 5.04307 3.76552 4.55405 4.16562Z"
								fill="currentColor"
							/>
						</svg>
						<span>{texts.title}</span>
					</button>
					{cat.mandatory ? (
						<span className="supt-gdpr-category__status">
							{texts.alwaysEnabled}
						</span>
					) : (
						<div
							className="supt-gdpr-category__switch"
							onClick={stopPropagation}
						>
							<input
								type="checkbox"
								className="supt-gdpr-category__checkbox"
								id={`cookie-law-category-checkbox-${cat.id}`}
								checked={isEnabled ?? false}
								onChange={onChange}
							/>
							<label
								className="supt-gdpr-category__label"
								htmlFor={`cookie-law-category-checkbox-${cat.id}`}
							>
								{texts[isEnabled ? 'disable' : 'enable']}
							</label>
							<span className="supt-gdpr-category__status">
								{texts[isEnabled ? 'enabled' : 'disabled']}
							</span>
						</div>
					)}
				</div>
				<div
					className="supt-gdpr-category__content"
					aria-hidden={isCollapsed}
				>
					<div className="supt-gdpr-category__desc">
						{texts.description}
					</div>
				</div>
			</li>
		);
	}
);

GdprCategory.displayName = 'GdprCategory';
