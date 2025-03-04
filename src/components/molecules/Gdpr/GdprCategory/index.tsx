import {
	forwardRef,
	useState,
	useEffect,
	useImperativeHandle,
	Ref,
	ChangeEvent,
	MouseEvent,
	useCallback,
} from 'react';
import cx from 'classnames';

import { useLocale } from '@/contexts/locale-context';
import { ChevronIcon } from '@/components/icons';

import './styles.css';

/**
 * TYPINGS
 */
type GdprCategoryProps = {
	cat: Record<string, any>;
	handleChange: (param: { enabled: boolean; id: string }) => void;
};

/**
 * COMPONENT
 */
export const GdprCategory = forwardRef(
	({ cat, handleChange }: GdprCategoryProps, ref: Ref<{}>) => {
		const [isCollapsed, setIsCollapsed] = useState(true);
		const [isEnabled, setIsEnabled] = useState(cat['enabled']);

		const { locale } = useLocale();

		useEffect(() => {
			handleChange({
				enabled: isEnabled,
				id: cat.id,
			});
		}, [isEnabled, cat.id, handleChange]);

		// Allows to call these functions from the parent
		useImperativeHandle(ref, () => ({
			getId,
			setEnabled,
		}));

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
			return cat['id'];
		}, [cat]);

		const setEnabled = useCallback(
			(enabled = false) => {
				if (cat['mandatory']) return;
				setIsEnabled(enabled);
			},
			[setIsEnabled, cat]
		);

		return (
			<li
				className={cx('supt-gdpr-category', {
					'-is-expanded': !isCollapsed,
				})}
			>
				<div className="supt-gdpr-category__tab" onClick={onToggle}>
					<button className="supt-gdpr-category__title">
						<ChevronIcon className="supt-gdpr-category__icon" />
						<span>{cat['title']}</span>
					</button>
					{cat['mandatory'] ? (
						<span className="supt-gdpr-category__caption">
							{cat.texts[locale].alwaysEnabled}
						</span>
					) : (
						<div
							className="supt-gdpr-category__switch"
							onClick={stopPropagation}
						>
							<input
								type="checkbox"
								className="supt-gdpr-category__checkbox"
								id={`cookie-law-category-checkbox-${cat['id']}`}
								checked={isEnabled}
								onChange={onChange}
							/>
							<label
								className="supt-gdpr-category__label"
								htmlFor={`cookie-law-category-checkbox-${cat['id']}`}
							>
								{
									cat.texts[locale][
										isEnabled ? 'disable' : 'enable'
									]
								}
							</label>
							<span className="supt-gdpr-category__status">
								{
									cat.texts[locale][
										isEnabled ? 'enabled' : 'disabled'
									]
								}
							</span>
						</div>
					)}
				</div>
				<div
					className="supt-gdpr-category__content"
					aria-hidden={isCollapsed}
				>
					<div className="supt-gdpr-category__desc">
						{cat['description']}
					</div>
				</div>
			</li>
		);
	}
);

GdprCategory.displayName = 'GdprCategory';
