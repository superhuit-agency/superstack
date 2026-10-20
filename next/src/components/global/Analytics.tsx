import { GoogleTagManager } from '@next/third-parties/google';

import { GoogleTagManagerPageview } from '@/components/custom/atoms/GoogleTagManagerPageview';
import { consentDefaultsScript } from '@/components/custom/molecules/Gdpr/consent';
import { LazyGdpr } from '@/components/custom/molecules/Gdpr/lazy';
import configs from '@/configs.json';

/**
 * Google Tag Manager, with the cookie consent banner (Google Consent Mode v2)
 * when `hasGdpr` is on. Rendered in the root layout, inside `LocaleProvider`.
 * See docs/setup/gdpr.md
 */
export function Analytics() {
	const gtmId = process.env.GOOGLE_TAG_MANAGER_ID;

	return (
		<>
			{configs.hasGdpr ? (
				<>
					<script
						dangerouslySetInnerHTML={{
							__html: consentDefaultsScript,
						}}
					/>
					<LazyGdpr />
				</>
			) : null}
			{gtmId ? (
				<>
					<GoogleTagManager gtmId={gtmId} />
					<GoogleTagManagerPageview />
				</>
			) : null}
		</>
	);
}
