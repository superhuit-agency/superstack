import { draftMode, cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
	const path = request.nextUrl.searchParams.get('redirect') ?? '/';

	(await draftMode()).disable();

	// Delete preview-draft + token cookies
	const cookieStore = await cookies();
	cookieStore.delete('token');
	cookieStore.delete('preview-draft');

	const url = `/${path ? path.replace(/\//, '') : ''}`;

	return redirect(url);
}
