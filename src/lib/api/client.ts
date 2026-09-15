export type ProblemError = { location?: string; message?: string; value?: unknown };
export type ProblemDetails = { type?: string; title?: string; status?: number; detail?: string; errors?: ProblemError[] | null; instance?: string };
export type ApiErrorBody = {
	code: string;
	message: string;
	problem: ProblemDetails;
	request_id?: string;
	field_errors?: Record<string, string>;
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

const publicApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';
const serverApiBaseUrl = import.meta.env.VITE_API_INTERNAL_URL ?? publicApiBaseUrl;
const apiBaseUrl = typeof window === 'undefined' ? serverApiBaseUrl : publicApiBaseUrl;
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

function problemDetails(value: unknown): ProblemDetails {
	if (!isRecord(value)) return {};
	const problem: ProblemDetails = {};
	if (typeof value.type === 'string') problem.type = value.type; if (typeof value.title === 'string') problem.title = value.title;
	if (typeof value.status === 'number') problem.status = value.status; if (typeof value.detail === 'string') problem.detail = value.detail;
	if (typeof value.instance === 'string') problem.instance = value.instance;
	if (Array.isArray(value.errors)) {
		problem.errors = value.errors.filter(isRecord).map((error) => ({ location: typeof error.location === 'string' ? error.location : undefined, message: typeof error.message === 'string' ? error.message : undefined, value: error.value }));
	}
	return problem;
}

function problemCode(problem: ProblemDetails, status: number) {
	const text = `${problem.type ?? ''} ${problem.title ?? ''} ${problem.detail ?? ''}`.toLowerCase();
	if (text.includes('credential')) return 'invalid_credentials';
	if (text.includes('session') && (text.includes('idle') || text.includes('expired'))) return 'session_idle';
	if (status === 401 || text.includes('unauthorized') || text.includes('authentication')) return 'invalid_session';
	if (status === 403 || text.includes('forbidden')) return 'forbidden';
	if (status === 404 || text.includes('not found')) return 'not_found';
	if (status === 409 || text.includes('conflict')) return 'conflict';
	if (status === 422 || text.includes('validation') || text.includes('unprocessable')) return 'validation';
	return status >= 500 ? 'unexpected' : `HTTP_${status}`;
}

function decodeErrorBody(value: unknown, status: number): ApiErrorBody {
	const problem = problemDetails(value);
	const fallback: ApiErrorBody = {
		code: problemCode(problem, status),
		message: problem.detail ?? problem.title ?? 'Permintaan tidak dapat diproses.',
		problem
	};
	if (problem.errors?.length) {
		const fieldErrors = problem.errors.filter((error) => error.location && error.message).map((error) => [error.location!, error.message!]);
		if (fieldErrors.length) fallback.field_errors = Object.fromEntries(fieldErrors);
	}
	return fallback;
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
	if (error.status === 401 && ['invalid_credentials', 'invalid_session', 'session_idle'].includes(error.body.code)) {
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
