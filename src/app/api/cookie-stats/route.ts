import { NextResponse, type NextRequest } from 'next/server';
import { getWpUrl } from '@/utils/node-utils';

const ALLOWED_EVENTS = ['impression', 'accept', 'reject', 'personalize'];

/**
 * Resolve the real visitor IP from available headers.
 * Order of priority:
 *  1. x-forwarded-for (set by reverse proxies / load balancers)
 *  2. x-real-ip (set by some proxies like nginx)
 *  3. Next.js request.ip (available in some runtimes)
 */
function getVisitorIp(request: NextRequest): string {
	const forwardedFor = request.headers.get('x-forwarded-for');
	if (forwardedFor) {
		return forwardedFor.split(',')[0].trim();
	}

	const realIp = request.headers.get('x-real-ip');
	if (realIp) {
		return realIp.trim();
	}

	// Next.js built-in (works on Vercel and some other platforms)
	if (request.ip) {
		return request.ip;
	}

	return '';
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { event_type } = body;

		if (!event_type || !ALLOWED_EVENTS.includes(event_type)) {
			return NextResponse.json(
				{ success: false, message: 'Invalid event type.' },
				{ status: 400 }
			);
		}

		const visitorIp = getVisitorIp(request);
		const userAgent = request.headers.get('user-agent') || '';

		// Forward the request to WordPress REST API
		const wpUrl = getWpUrl();
		const response = await fetch(`${wpUrl}/wp-json/supt/v1/cookie-stats`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(visitorIp ? { 'X-Forwarded-For': visitorIp } : {}),
				...(userAgent ? { 'User-Agent': userAgent } : {}),
			},
			body: JSON.stringify({ event_type }),
		});

		const data = await response.json();

		return NextResponse.json(data, { status: response.status });
	} catch {
		// Silent fail - analytics should not break anything
		return NextResponse.json({ success: false }, { status: 500 });
	}
}
