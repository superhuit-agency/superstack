import { draftMode, cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

import getSameOriginPath from '@/lib/get-same-origin-path';

export async function GET(request: NextRequest) {
	const path = request.nextUrl.searchParams.get('redirect');

	// Not destructured: `disable()` reads `this`
	(await draftMode()).disable();

	// Delete preview-draft + token cookies
	const cookieStore = await cookies();
	cookieStore.delete('token');
	cookieStore.delete('preview-draft');

	return redirect(getSameOriginPath(path, request.nextUrl.origin));
}
