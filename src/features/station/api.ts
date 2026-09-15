import { apiFetch } from '$lib/api/client';

export type Station = {
	id: string;
	name: string;
	code: string | null;
	address: string;
	timezone: string;
	enabled: boolean;
};

export type StationInput = Omit<Station, 'id'>;

function record(value: unknown): Record<string, unknown> {
	return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
}

function stationView(value: unknown): Station {
	const source = record(value);
	return {
		id: String(source.station_id ?? source.id ?? ''),
		name: String(source.name ?? ''),
		code: typeof source.code === 'string' ? source.code : null,
		address: String(source.address ?? ''),
		timezone: String(source.timezone ?? ''),
		enabled: Boolean(source.enabled)
	};
}

export function getStations() {
	return apiFetch<unknown>('/stations').then((stations) => (Array.isArray(stations) ? stations : []).map(stationView));
}

export function getStation(id: string) {
	return apiFetch<unknown>(`/stations/${encodeURIComponent(id)}`).then(stationView);
}

export function createStation(input: Omit<StationInput, 'enabled'>) {
	return apiFetch<unknown>('/stations', { method: 'POST', body: JSON.stringify(input) }).then(stationView);
}

export function updateStation(id: string, input: StationInput) {
	return apiFetch<unknown>(`/stations/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) }).then(stationView);
}

export function disableStation(id: string) {
	return apiFetch<void>(`/stations/${encodeURIComponent(id)}/disable`, { method: 'POST' });
}
