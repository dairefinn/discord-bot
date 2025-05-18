const RESPONSE_HEADERS = {
	"Content-Type": "application/json",
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "*",
} as const;

export interface ErrorResponse {
	error: string;
}

export function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: RESPONSE_HEADERS,
	});
}

export function errorResponse(message: string, status = 400): Response {
	return jsonResponse({ error: message } as ErrorResponse, status);
}

export function corsOptionsResponse(): Response {
	return new Response(null, {
		headers: RESPONSE_HEADERS,
	});
}

export function redirectResponse(url: string): Response {
	return new Response(null, {
		status: 302,
		headers: {
			Location: url,
			...RESPONSE_HEADERS,
		},
	});
}
