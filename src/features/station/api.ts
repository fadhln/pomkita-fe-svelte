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

export function getStations() {
	return apiFetch<Station[]>('/stations').then((stations) => stations ?? []);
}

export function getStation(id: string) {
	return apiFetch<Station>(`/stations/${encodeURIComponent(id)}`);
}

export function createStation(input: Omit<StationInput, 'enabled'>) {
	return apiFetch<Station>('/stations', { method: 'POST', body: JSON.stringify(input) });
}

export function updateStation(id: string, input: StationInput) {
	return apiFetch<Station>(`/stations/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function disableStation(id: string) {
	return apiFetch<void>(`/stations/${encodeURIComponent(id)}/disable`, { method: 'POST' });
}
