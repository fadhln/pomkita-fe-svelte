export type ApiErrorBody = {
	code: string;
	message: string;
	request_id?: string;
	field_errors?: Record<string, string>;
	conflict_period?: string;
};

export class ApiError extends Error {
	readonly status: number;
	readonly body: ApiErrorBody;
	readonly requestId?: string;

	constructor(status: number, body: ApiErrorBody) {
		super(body.message);
		this.name = 'ApiError';
		this.status = status;
		this.body = body;
		this.requestId = body.request_id;
	}
}

export type SessionExpiredHandler = (error: ApiError) => void;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
let sessionExpiredHandler: SessionExpiredHandler | undefined;

export function setSessionExpiredHandler(handler: SessionExpiredHandler | undefined) {
	sessionExpiredHandler = handler;
}

function requestId() {
	if (globalThis.crypto?.randomUUID) {
		return globalThis.crypto.randomUUID();
	}
	return `request-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isMutation(method: string) {
	return !['GET', 'HEAD', 'OPTIONS'].includes(method);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function decodeErrorBody(value: unknown, status: number): ApiErrorBody {
	const fallback: ApiErrorBody = {
		code: status === 401 ? 'invalid_session' : status >= 500 ? 'unexpected' : `HTTP_${status}`,
		message: 'Permintaan tidak dapat diproses.'
	};
	if (!isRecord(value)) return fallback;

	const body: ApiErrorBody = {
		code: typeof value.code === 'string' ? value.code : fallback.code,
		message: typeof value.message === 'string' ? value.message : fallback.message
	};
	if (typeof value.request_id === 'string') body.request_id = value.request_id;
	if (isRecord(value.field_errors)) {
		const fieldErrors = Object.entries(value.field_errors).filter(
			([, message]) => typeof message === 'string'
		);
		body.field_errors = Object.fromEntries(fieldErrors) as Record<string, string>;
	}
	if (typeof value.conflict_period === 'string') body.conflict_period = value.conflict_period;
	return body;
}

function parseJson(value: string): unknown {
	if (!value) return undefined;
	try {
		return JSON.parse(value) as unknown;
	} catch {
		return undefined;
	}
}

function notifySessionExpiry(error: ApiError) {
	if (error.status === 401 && ['invalid_session', 'session_idle'].includes(error.body.code)) {
		sessionExpiredHandler?.(error);
	}
}

function requestOptions(
	init: RequestInit | undefined,
	accept: string,
	includeJsonContentType: boolean
): RequestInit {
	const method = (init?.method ?? 'GET').toUpperCase();
	const headers = new Headers(init?.headers);
	headers.set('Accept', accept);
	if (includeJsonContentType && init?.body !== undefined && !headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json');
	}
	if (isMutation(method) && !headers.has('X-Requested-With')) {
		headers.set('X-Requested-With', 'XMLHttpRequest');
	}
	if (!headers.has('X-Request-ID')) headers.set('X-Request-ID', requestId());
	return { ...init, method, credentials: 'include', headers };
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(`${apiBaseUrl}${path}`, requestOptions(init, 'application/json', true));
	const responseRequestId = response.headers.get('X-Request-ID') ?? undefined;
	const decodedBody = parseJson(await response.text());

	if (!response.ok) {
		const body = decodeErrorBody(decodedBody, response.status);
		if (responseRequestId) body.request_id = responseRequestId;
		const error = new ApiError(response.status, body);
		notifySessionExpiry(error);
		throw error;
	}

	return decodedBody as T;
}

export async function apiFetchText(path: string, init?: RequestInit): Promise<string> {
	const response = await fetch(`${apiBaseUrl}${path}`, requestOptions(init, 'text/csv', false));
	const responseText = await response.text();
	if (!response.ok) {
		const body = decodeErrorBody(parseJson(responseText), response.status);
		const responseRequestId = response.headers.get('X-Request-ID');
		if (responseRequestId) body.request_id = responseRequestId;
		const error = new ApiError(response.status, body);
		notifySessionExpiry(error);
		throw error;
	}
	return responseText;
}
