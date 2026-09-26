import type { Session } from '$lib/session/api';

const activeStationCookie = 'pomkita_active_station';

export type StationOption = { id: string; name?: string | null };

function browserCookieValue() {
	if (typeof document === 'undefined') return '';
	const cookie = document.cookie.split('; ').find((item) => item.startsWith(`${activeStationCookie}=`));
	if (!cookie) return '';
	try {
		return decodeURIComponent(cookie.slice(activeStationCookie.length + 1));
	} catch {
		return '';
	}
}

export function setActiveStationCookie(stationId: string) {
	if (typeof document !== 'undefined') {
		document.cookie = `${activeStationCookie}=${encodeURIComponent(stationId)}; Path=/; SameSite=Lax`;
	}
}

export function clearActiveStationCookie() {
	if (typeof document !== 'undefined') document.cookie = `${activeStationCookie}=; Path=/; Max-Age=0; SameSite=Lax`;
}

type StationSession = { station_ids?: string[] | null; active_context?: Session['active_context'] | null };

export function activeStationForSession(session: StationSession | null | undefined, candidate = browserCookieValue()) {
	if (session?.active_context?.station_id) return session.active_context.station_id;
	const stationIds = session?.station_ids ?? [];
	const activeStation = candidate && stationIds.includes(candidate) ? candidate : stationIds[0] ?? '';
	if (activeStation && activeStation !== browserCookieValue()) setActiveStationCookie(activeStation);
	return activeStation;
}

export function permittedStations(session: StationSession | null | undefined, stations: StationOption[] = [], scope: 'permitted' | 'organization' = 'permitted') {
	const stationDetails = new Map(stations.map((station) => [station.id, station]));
	if (scope === 'organization') {
		return stations.map(({ id, name }) => ({ id, name: name ?? stationDetails.get(id)?.name ?? null }));
	}
	if (session?.active_context?.station_id) {
		const id = session.active_context.station_id;
		return [{ id, name: stationDetails.get(id)?.name ?? null }];
	}
	return (session?.station_ids ?? []).map((id) => ({ id, name: stationDetails.get(id)?.name ?? null }));
}
