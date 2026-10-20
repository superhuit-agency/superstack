import cx from 'classnames';
import {
	FC,
	MouseEvent,
	MouseEventHandler,
	useCallback,
	useEffect,
	useState,
} from 'react';

import Button from '@/components/core/Button';
import { useLocale } from '@/contexts/locale-context';

import './styles.css';

/**
 * TYPINGS
 */
interface GdprBannerProps {
	bannerDismissed: boolean;
	onPersonalizeClick: MouseEventHandler;
	onAcceptClick: () => void;
	onRejectClick: () => void;
}

/**
 * COMPONENT
 */
export const GdprBanner: FC<GdprBannerProps> = ({
	bannerDismissed,
	onAcceptClick,
	onPersonalizeClick,
	onRejectClick,
}) => {
	const [isHidden, setIsHidden] = useState(true);
	const [isUnmounting, setIsUnmounting] = useState(false);

	const { dictionary } = useLocale();

	const handleAcceptClick = useCallback(
		(event: MouseEvent) => {
			event.stopPropagation();

			setIsUnmounting(true);

			window.setTimeout(() => {
				onAcceptClick();
				setIsHidden(true);
			}, 300);
		},
		[setIsHidden, onAcceptClick]
	);

	const handleRejectClick = useCallback(
		(event: MouseEvent) => {
			event.stopPropagation();

			setIsUnmounting(true);

			window.setTimeout(() => {
				onRejectClick();
				setIsHidden(true);
			}, 300);
		},
		[onRejectClick, setIsHidden]
	);

	useEffect(() => {
		setIsHidden(bannerDismissed);
	}, [bannerDismissed]);

	return (
		<div
			className={cx('supt-gdpr-banner', {
				'-fade-out': isUnmounting,
			})}
			role="dialog"
			aria-live="polite"
			aria-hidden={isHidden}
			aria-labelledby="cookie-law-banner:title"
			aria-describedby="cookie-law-banner:desc"
		>
			<div className="supt-gdpr-banner__inner">
				<div className="supt-gdpr-banner__group">
					<p
						id="cookie-law-banner:title"
						className="supt-gdpr-banner__title"
					>
						{dictionary.gdpr.banner.title}
					</p>
					<div
						id="cookie-law-banner:desc"
						className="supt-gdpr-banner__message"
					>
						<p
							dangerouslySetInnerHTML={{
								__html: dictionary.gdpr.banner.message,
							}}
						/>
					</div>
				</div>

				<div className="supt-gdpr-banner__buttons">
					<Button
						text={dictionary.gdpr.banner.acceptAll}
						className="supt-gdpr-banner__accept-button"
						onClick={handleAcceptClick}
					/>

					<Button
						text={dictionary.gdpr.banner.personalize}
						className="supt-gdpr-banner__personalize-button"
						onClick={onPersonalizeClick}
						variant="outline"
					/>

					<Button
						text={dictionary.gdpr.banner.rejectAll}
						className="supt-gdpr-banner__reject-button"
						onClick={handleRejectClick}
						variant="outline"
					/>
				</div>
			</div>
		</div>
	);
};
