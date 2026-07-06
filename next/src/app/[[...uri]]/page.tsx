import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { draftMode, cookies } from 'next/headers';
import { notFound, permanentRedirect, redirect } from 'next/navigation';

import Template from '@/components/global/Template';
import { useCanonical as getCanonicalUrl } from '@/hooks/use-canonical';
import {
	getAllURIs,
	getAuthToken,
	getNodeByURI,
	getRedirection,
	getWpUriFromNextPath,
} from '@/lib';
import { baseUriContext } from '@/hooks/use-base-uri';

export const revalidate = 3600;

export async function generateStaticParams() {
	const allURIs = await getAllURIs();

	return allURIs;
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ uri: string[]; lang: Locale }>;
}): Promise<Metadata> {
	const { uri: uriSegments, lang } = await params;
	const uri = getWpUriFromNextPath(uriSegments ?? []);

	const baseUrl =
		process.env.NEXT_URL ??
		process.env.VERCEL_URL ??
		'http://localhost:3000';

	const node = await getNodeByURI(uri, false, {}, false, false, 1, lang);

	const imageSEO =
		node?.seo?.opengraphImage?.src ??
		node?.siteSEO?.openGraph?.defaultImage?.src ??
		'';

	const canonical = getCanonicalUrl(node);

	const urlSEO = node?.seo?.opengraphUrl?.startsWith('https')
		? node?.language
			? `/${node?.language.code.toLowerCase()}/`
			: '/'
		: node?.seo?.opengraphUrl;

	return {
		metadataBase: new URL(baseUrl),
		title: node?.seo?.title ?? node?.title,
		description:
			node?.seo?.opengraphDescription ?? node?.seo?.metaDesc ?? '',
		alternates: {
			canonical: canonical,
			languages: node?.translations?.reduce(
				(
					acc: Record<string, string>,
					t: {
						uri?: string;
						language?: { locale?: string; code?: string } | null;
					}
				) => {
					if (!t.language || !t.language.locale || !t.language.code)
						return acc;

					return {
						...acc,
						[t.language.locale?.replace('_', '-')]:
							(node?.baseUrl || '') +
							(t.uri === '/'
								? `/${t.language.code.toLowerCase()}/`
								: t.uri),
					};
				},
				{}
			),
		},
		openGraph: {
			title: node?.seo?.title ?? node?.title,
			description:
				node?.seo?.opengraphDescription ?? node?.seo?.metaDesc ?? '',
			siteName: node?.siteSEO?.schema?.siteName,
			images: [
				{
					url: imageSEO,
					alt: node?.seo?.title,
				},
			],
			url: urlSEO,
		},
		twitter: {
			title: node?.seo?.twitterTitle ?? node?.seo?.title,
			description:
				node?.seo?.twitterDescription ??
				node?.seo?.opengraphDescription,
			images: [
				{
					url: node?.seo?.twitterImage?.src ?? imageSEO,
					alt: node?.seo?.twitterImage?.alt ?? node?.seo?.title,
				},
			],
			card:
				node?.siteSEO?.social?.twitter?.cardType ??
				'summary_large_image',
			creator: node?.siteSEO?.social?.twitter?.username,
		},
		robots: {
			index: node?.seo?.metaRobotsNoindex === 'index',
			follow: node?.seo?.metaRobotsNofollow === 'follow',
		},
	};
}

const PreviewToolbar = dynamic(
	() => import('@/components/admin/PreviewToolbar')
);

export default async function Page({
	params,
}: {
	params: Promise<{ uri: string[]; lang: Locale }>;
}) {
	const { uri: uriSegments, lang } = await params;
	const { isEnabled: isDraftModeEnable } = await draftMode();

	let isDraft = false,
		token = '';

	/** Query loop pagination */
	const rawSegments = uriSegments ?? [];
	const isPagedRoute =
		rawSegments.length >= 2 &&
		rawSegments[rawSegments.length - 2] === 'page';

	const pageRaw = isPagedRoute ? rawSegments[rawSegments.length - 1] : null;
	const routePage = pageRaw ? Number.parseInt(pageRaw, 10) : null;

	const normalizedRoutePage =
		Number.isFinite(routePage) && (routePage as number) > 0
			? (routePage as number)
			: null;

	const baseSegments = normalizedRoutePage
		? rawSegments.slice(0, -2)
		: rawSegments;
	/** End of query loop pagination */

	const uri = getWpUriFromNextPath(baseSegments);
	baseUriContext(uri);

	let auth: { authToken?: string } = {};

	if (isDraftModeEnable) {
		const cookieStore = await cookies();

		token = cookieStore.get('token')?.value ?? '';
		isDraft = cookieStore.get('preview-draft')?.value === 'true';

		if (token) {
			auth = {
				authToken: await getAuthToken(token),
			};
		}

		if (!auth.authToken) {
			redirect(`/api/preview-exit?redirect=${uri}`);
		}
	}

	const redirection = await getRedirection(uri);
	if (redirection) {
		if (redirection.isPermanent) {
			permanentRedirect(redirection.destination);
		} else {
			redirect(redirection.destination);
		}
	}

	const node = await getNodeByURI(
		uri,
		isDraftModeEnable,
		auth,
		isDraft,
		true,
		normalizedRoutePage ?? 1,
		lang
	);

	if (!node || !node?.uri) {
		return notFound();
	}

	return (
		<>
			<Template node={node} />

			{isDraftModeEnable ? (
				<PreviewToolbar isDraft={isDraft} editLink={node?.editLink} />
			) : null}
		</>
	);
}
