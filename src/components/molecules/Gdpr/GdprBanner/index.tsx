import cx from 'classnames';
import {
	FC,
	useEffect,
	useState,
	MouseEventHandler,
	useRef,
	MouseEvent,
	useCallback,
} from 'react';

import { useLocale } from '@/contexts/locale-context';

import { Button } from '@/components/atoms';

import './styles.css';

/**
 * TYPINGS
 */
interface GdprBannerProps {
	bannerDismissed: boolean;
	onPersonalizeClick: MouseEventHandler;
	onAcceptClick: Function;
	onRejectClick: Function;
};

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

	const ref = useRef(null);

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
		if (bannerDismissed) setIsHidden(true);
		else setIsHidden(false);
	}, [bannerDismissed]);

	return (
		<div
			className={cx('supt-gdpr-banner', {
				'-fade-out': isUnmounting,
			})}
			role="dialog"
			aria-live="polite"
			aria-hidden={isHidden}
			aria-label="cookie-law-banner:title"
			aria-describedby="cookie-law-banner:desc"
			ref={ref}
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
						title={dictionary.gdpr.banner.acceptAll}
						className="supt-gdpr-banner__accept-button"
						onClick={handleAcceptClick}
						variant="link"
					/>

					<Button
						title={dictionary.gdpr.banner.personalize}
						className="supt-gdpr-banner__personalize-button"
						onClick={onPersonalizeClick}
						variant="link"
					/>

					<Button
						className="supt-gdpr-banner__reject-button"
						onClick={handleRejectClick}
						title={dictionary.gdpr.banner.rejectAll}
						variant="link"
					/>
				</div>
			</div>
		</div>
	);
};
