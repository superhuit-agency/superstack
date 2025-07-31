import { NextResponse, type NextRequest } from 'next/server';
import { draftMode, cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getAuthToken, getPreviewNode } from '@/lib';

export async function GET(request: NextRequest) {
	// pass an id or slug for page/post
	// OR pass a uri for terms archives (category, tag)
	const { secret, slug, token, uri, id, draft } = Object.fromEntries(
		request.nextUrl.searchParams
	);

	const WORDPRESS_PREVIEW_SECRET =
		process.env.WORDPRESS_PREVIEW_SECRET ?? 'spck';

	// Check the secret and next parameters
	// This secret should only be known by this API route
	if (
		!WORDPRESS_PREVIEW_SECRET ||
		secret !== WORDPRESS_PREVIEW_SECRET ||
		(!id && !slug && !uri)
	) {
		return NextResponse.json(
			{ message: 'Invalid request' },
			{ status: 401 }
		);
	}

	const auth = {
		authToken: await getAuthToken(token),
	};

	if (!auth.authToken) {
		return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
	}

	// Fetch WordPress to check if the provided `id` or `slug` exists
	let node;
	if (!uri) {
		node = await getPreviewNode({
			id: id ?? slug,
			idType: id ? 'DATABASE_ID' : 'SLUG',
			auth,
		});

		if (!node) {
			return NextResponse.json(
				{ message: 'Node not found' },
				{ status: 404 }
			);
		}
	}

	(await draftMode()).enable();

	let location;
	if (node) {
		if (node.status === 'publish') location = node.uri;
		else location = `${getUriPrefix(node)}${node.databaseId}/`;
	} else {
		location = uri;
	}

	// Set cookies to pass token + preview-draft
	// (Note: We used to pass these as search params but it wasn't working)
	const cookieStore = await cookies();
	cookieStore.set('token', token); // Expires when the browser closes (at the end of the session) -- same as Next.js draftMode cookie
	cookieStore.set('preview-draft', draft ? 'true' : 'false'); // Expires when the browser closes (at the end of the session) -- same as Next.js draftMode cookie

	return redirect(location);
}

const getUriPrefix = (node: any) => {
	return node.language ? '/' + node.language.code.toLowerCase() + '/' : '/';
};
