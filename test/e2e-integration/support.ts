import { execFileSync } from 'node:child_process';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { APIRequestContext, Page } from '@playwright/test';

const beBaseUrl = process.env.S5_BE_URL ?? `http://localhost:${process.env.S5_BE_PORT ?? '8180'}/api/v1`;

export const demo = {
	supervisor: { username: 'demo.supervisor', password: 'demo-password' },
	admin: { username: 'demo.station-admin', password: 'demo-password' },
	owner: { username: 'demo.owner', password: 'demo-password' },
	stationId: '22222222-2222-4222-8222-222222222222',
	dispenserId: '33333333-3333-4333-8333-333333333333',
	nozzleId: '44444444-4444-4444-8444-444444444444',
	pendingAmendmentId: '15151515-1515-4151-8151-151515151515'
};

export function resetToSeed() {
	execFileSync('sh', ['scripts/it-reset-seed.sh'], { stdio: 'inherit' });
}

export async function activationLinkFor(recipient: string) {
	const spoolDirectory = process.env.S5_MAIL_SPOOL_DIR ?? resolve('test/e2e-integration/mail-spool');
	const deadline = Date.now() + 30_000;
	while (Date.now() < deadline) {
		const entries = await readdir(spoolDirectory, { withFileTypes: true }).catch(() => []);
		const messages = await Promise.all(entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json')).map(async (entry) => {
			const path = join(spoolDirectory, entry.name);
			const [message, details] = await Promise.all([
				readFile(path, 'utf8').then((value) => JSON.parse(value) as { to?: string; text_body?: string }).catch(() => undefined),
				stat(path).catch(() => undefined)
			]);
			return message && details ? { message, modifiedAt: details.mtimeMs } : undefined;
		}));
		messages.sort((left, right) => (right?.modifiedAt ?? 0) - (left?.modifiedAt ?? 0));
		for (const item of messages) {
			if (item?.message.to !== recipient) continue;
			const match = item.message.text_body?.match(/https?:\/\/[^\s]+\/aktivasi\?token=[^\s]+/u);
			if (match) return match[0];
		}
		await new Promise((resolveWait) => setTimeout(resolveWait, 100));
	}
	throw new Error(`No activation message found for ${recipient}.`);
}

export async function login(page: Page, credentials: { username: string; password: string }) {
	await page.goto('/masuk', { waitUntil: 'networkidle' });
	await page.getByLabel('Nama pengguna').fill(credentials.username);
	await page.getByLabel('Kata Sandi').fill(credentials.password);
	await page.getByRole('button', { name: 'Masuk' }).click();
	await page.waitForURL(/\/$/u);
}

export async function loginAsSupervisor(page: Page) { await login(page, demo.supervisor); }
export async function loginAsAdmin(page: Page) { await login(page, demo.admin); }
export async function loginAsOwner(page: Page) { await login(page, demo.owner); }

async function expectOk(response: Awaited<ReturnType<APIRequestContext['post']>>, label: string) {
	if (!response.ok()) throw new Error(`${label}: ${response.status()} ${await response.text()}`);
}

export async function createSubmittedShift(request: APIRequestContext) {
	const headers = { 'X-Requested-With': 'XMLHttpRequest' };
	const loginResponse = await request.post(`${beBaseUrl}/login`, { data: demo.supervisor, headers });
	await expectOk(loginResponse, 'login');
	const openedResponse = await request.post(`${beBaseUrl}/shifts`, {
		data: {
			station_id: demo.stationId,
			opened_at: new Date().toISOString(),
			backfilled: false,
			backfill_approver: null,
			backfill_reason: '',
			original_event_date: '',
			shift_ke: 0
		},
		headers
	});
	await expectOk(openedResponse, 'open shift');
	const opened = await openedResponse.json() as { shift_id: string };
	return submitExistingShift(request, opened.shift_id);
}

export async function submitExistingShift(request: APIRequestContext, shiftId: string) {
	const headers = { 'X-Requested-With': 'XMLHttpRequest' };
	const loginResponse = await request.post(`${beBaseUrl}/login`, { data: demo.supervisor, headers });
	await expectOk(loginResponse, 'login');
	const detailResponse = await request.get(`${beBaseUrl}/shifts/${shiftId}?station_id=${demo.stationId}`);
	await expectOk(detailResponse, 'read shift detail');
	const detail = await detailResponse.json() as { draft_id: string; revision: number };
	const claimResponse = await request.post(`${beBaseUrl}/drafts/claim`, {
		data: { station_id: demo.stationId, shift_id: shiftId, draft_id: detail.draft_id },
		headers
	});
	await expectOk(claimResponse, 'claim draft');
	const claim = await claimResponse.json() as { draft_id: string; claim_token: string; revision: number };
	const readingResponse = await request.post(`${beBaseUrl}/drafts/readings`, {
		data: { station_id: demo.stationId, draft_id: claim.draft_id, claim_token: claim.claim_token, revision: claim.revision, nozzle_id: demo.nozzleId, meter_start: '100.0', meter_end: '110.0' },
		headers
	});
	await expectOk(readingResponse, 'write reading');
	const readingRevision = await readingResponse.json() as { revision: number };
	const saleResponse = await request.post(`${beBaseUrl}/drafts/sales`, {
		data: { station_id: demo.stationId, draft_id: claim.draft_id, claim_token: claim.claim_token, revision: readingRevision.revision, dispenser_id: demo.dispenserId, cash_amount: '10000', cashless_amount: '0' },
		headers
	});
	await expectOk(saleResponse, 'write sale');
	const saleRevision = await saleResponse.json() as { revision: number };
	const submitResponse = await request.post(`${beBaseUrl}/submissions`, {
		data: {
			station_id: demo.stationId,
			shift_id: shiftId,
			draft_id: claim.draft_id,
			claim_token: claim.claim_token,
			revision: saleRevision.revision,
			payload: {
				hash_version: 1,
				readings: [{ nozzle_id: demo.nozzleId, meter_start: '100.0', meter_end: '110.0' }],
				sales: [{ dispenser_id: demo.dispenserId, cash_amount: '10000', cashless_amount: '0' }],
				losses: []
			}
		},
		headers: { ...headers, 'Idempotency-Key': `s5-${Date.now()}-${Math.random()}` }
	});
	await expectOk(submitResponse, 'submit shift');
	const submitted = await submitResponse.json() as { report_id: string };
	return { shiftId, reportId: submitted.report_id };
}

export async function openNewShift(page: Page) {
	await loginAsSupervisor(page);
	await page.getByRole('link', { name: 'Shift', exact: true }).click();
	await page.getByRole('button', { name: 'Buka shift' }).click();
	await page.waitForURL(/\/shift\/[0-9a-f-]+$/u);
	await page.getByText('Input Shift', { exact: true }).waitFor();
	await page.getByText('Klaim draft aktif', { exact: true }).waitFor();
}
