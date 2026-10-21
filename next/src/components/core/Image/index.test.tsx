import type { ImageProps as NextImageProps } from 'next/image';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Image from '.';

const nextImageProps = vi.hoisted(() => [] as Record<string, unknown>[]);

vi.mock('next/image', async (importOriginal) => {
	const { default: NextImage } =
		await importOriginal<typeof import('next/image')>();

	return {
		default: (props: NextImageProps) => {
			nextImageProps.push({ ...props });
			return <NextImage {...props} />;
		},
	};
});

const getImgTag = (html: string) => html.match(/<img [^>]*>/)?.[0] ?? '';

describe('Image', () => {
	beforeEach(() => {
		vi.stubEnv('NEXT_PUBLIC_IS_THIS_NEXT', 'true');
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		nextImageProps.length = 0;
	});

	it('preloads a priority image and fetches it with high priority', () => {
		const html = renderToStaticMarkup(
			<Image
				url="/hero.jpg"
				alt="Hero"
				width="1200"
				height="800"
				priority
			/>
		);

		expect(html).toMatch(/<link rel="preload"[^>]* as="image"/);
		expect(html).toMatch(/<link [^>]*imageSrcSet="[^"]*hero\.jpg/);
		expect(getImgTag(html)).toContain('fetchPriority="high"');
		expect(getImgTag(html)).not.toContain('loading="lazy"');
	});

	it('neither preloads nor prioritises a non-priority image, which stays lazy', () => {
		const html = renderToStaticMarkup(
			<Image url="/card.jpg" alt="Card" width="1200" height="800" />
		);

		expect(html).not.toContain('<link');
		expect(getImgTag(html)).not.toContain('fetchPriority');
		expect(getImgTag(html)).toContain('loading="lazy"');
	});

	it('never passes the deprecated priority prop to next/image', () => {
		renderToStaticMarkup(
			<>
				<Image
					url="/hero.jpg"
					alt="Hero"
					width="1200"
					height="800"
					priority
				/>
				<Image url="/card.jpg" alt="Card" width="1200" height="800" />
			</>
		);

		expect(nextImageProps).toHaveLength(2);
		for (const props of nextImageProps) {
			expect(props).not.toHaveProperty('priority');
		}
	});
});
