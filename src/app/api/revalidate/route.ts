import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
	// Check for secret to confirm this is a valid request
	if (
		request.nextUrl.searchParams.get('secret') !==
		process.env.REVALIDATE_SECRET
	) {
		return Response.json({ message: 'Invalid request' }, { status: 401 });
	}

	// this should be the actual path not a rewritten path
	// e.g. for "/blog/[slug]" this should be "/blog/post-1"
	const path = request.nextUrl.searchParams.get('path');

	if (path) {
		revalidatePath(path); // Only purges the cache
		await fetch(`${request.nextUrl.origin}${path}`); // We need to simulate the 1st request to put the new response in the cache (so the 1st user gets the new cached response)
		return Response.json({ revalidated: true, now: Date.now() });
	}

	return Response.json(
		{
			revalidated: false,
			now: Date.now(),
			message: 'Missing path to revalidate',
		},
		{ status: 500 }
	);
}
