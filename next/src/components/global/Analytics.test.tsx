import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Analytics } from './Analytics';

const configs = vi.hoisted(() => ({ hasGdpr: true }));

vi.mock('@/configs.json', () => ({ default: configs }));

vi.mock('@/components/custom/molecules/Gdpr/lazy', () => ({
	LazyGdpr: () => <div className="supt-gdpr" />,
}));

vi.mock('@next/third-parties/google', () => ({
	GoogleTagManager: ({ gtmId }: { gtmId: string }) => (
		<script id="gtm" data-gtm-id={gtmId} />
	),
}));

vi.mock('@/components/custom/atoms/GoogleTagManagerPageview', () => ({
	GoogleTagManagerPageview: () => <meta name="gtm-pageview" />,
}));

describe('Analytics', () => {
	beforeEach(() => {
		configs.hasGdpr = true;
		vi.stubEnv('GOOGLE_TAG_MANAGER_ID', 'GTM-TEST');
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('pushes the Consent Mode defaults before loading GTM, and renders the banner', () => {
		const html = renderToStaticMarkup(<Analytics />);

		const defaultsAt = html.indexOf("'consent','default'");
		expect(defaultsAt).toBeGreaterThan(-1);
		expect(html.indexOf('data-gtm-id="GTM-TEST"')).toBeGreaterThan(
			defaultsAt
		);
		expect(html).toContain('name="gtm-pageview"');
		expect(html).toContain('supt-gdpr');
	});

	it('only loads GTM and tracks page views when the flag is off', () => {
		configs.hasGdpr = false;

		const html = renderToStaticMarkup(<Analytics />);

		expect(html).not.toContain('consent');
		expect(html).not.toContain('supt-gdpr');
		expect(html).toContain('data-gtm-id="GTM-TEST"');
		expect(html).toContain('name="gtm-pageview"');
	});

	it('loads no GTM script without a GTM ID', () => {
		vi.stubEnv('GOOGLE_TAG_MANAGER_ID', '');

		const html = renderToStaticMarkup(<Analytics />);

		expect(html).not.toContain('data-gtm-id');
		expect(html).not.toContain('gtm-pageview');
		expect(html).toContain('supt-gdpr');
	});

	it('renders nothing with the flag off and no GTM ID', () => {
		configs.hasGdpr = false;
		vi.stubEnv('GOOGLE_TAG_MANAGER_ID', '');

		expect(renderToStaticMarkup(<Analytics />)).toBe('');
	});
});
