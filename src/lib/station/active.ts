import type { Session } from '$lib/session/api';

export const activeStationCookie = 'pomkita_active_station';

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

export function readActiveStationCookie() {
	return browserCookieValue();
}

export function setActiveStationCookie(stationId: string) {
	if (typeof document !== 'undefined') {
		document.cookie = `${activeStationCookie}=${encodeURIComponent(stationId)}; Path=/; SameSite=Lax`;
	}
}

export function clearActiveStationCookie() {
	if (typeof document !== 'undefined') document.cookie = `${activeStationCookie}=; Path=/; Max-Age=0; SameSite=Lax`;
}

type StationSession = Pick<Session, 'station_ids'> | { station_ids?: string[] | null };

export function activeStationForSession(session: StationSession | null | undefined, candidate = readActiveStationCookie()) {
	const stationIds = session?.station_ids ?? [];
	const activeStation = candidate && stationIds.includes(candidate) ? candidate : stationIds[0] ?? '';
	if (activeStation && activeStation !== readActiveStationCookie()) setActiveStationCookie(activeStation);
	return activeStation;
}

export function permittedStations(session: StationSession | null | undefined, stations: StationOption[] = []) {
	const stationDetails = new Map(stations.map((station) => [station.id, station]));
	return (session?.station_ids ?? []).map((id) => ({ id, name: stationDetails.get(id)?.name ?? null }));
}
