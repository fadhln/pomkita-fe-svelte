import { expect, test } from '@playwright/test';
import { activationLinkFor, login, loginAsOwner, resetToSeed } from './support';

test.describe.serial('Administration flow', () => {
	// The seed keeps master data (organizations, stations, users, roles) between
	// runs, and the suite does not delete the database volume. Every value with a
	// unique constraint or a text match therefore needs a per-run suffix.
	const runSuffix = Date.now().toString(36);
	const invitedEmail = `operator.${runSuffix}@demo.pomkita.test`;
	const invitedDisplayName = `Integration Operator ${runSuffix}`;
	const invitedCredentials = { username: `integration.operator.${runSuffix}`, password: 'integration-password' };
	const newStationName = `Stasiun Integrasi ${runSuffix}`;
	const newStationCode = `INT${runSuffix.toUpperCase()}`;
	let newStationId = '';
	let activationLink = '';

	test.beforeAll(() => resetToSeed());

	test('S6.1 the Owner signs in', async ({ page }) => {
		await loginAsOwner(page);
		await expect(page).toHaveURL(/\/$/u);
		await expect(page.getByRole('heading', { name: 'Beranda' })).toBeVisible();
	});

	test('S6.2 the Owner creates a station', async ({ page }) => {
		await loginAsOwner(page);
		await page.getByRole('link', { name: 'Stasiun', exact: true }).click();
		await expect(page.getByRole('heading', { name: 'Stasiun', exact: true })).toBeVisible();
		await page.getByLabel('Nama stasiun baru').fill(newStationName);
		await page.getByLabel('Kode stasiun baru').fill(newStationCode);
		await page.getByLabel('Alamat stasiun baru').fill('Jalan Integrasi 3, Jakarta');
		const [response] = await Promise.all([
			page.waitForResponse((item) => item.request().method() === 'POST' && /\/api\/v1\/stations$/u.test(item.url())),
			page.getByRole('button', { name: 'Tambah stasiun' }).click()
		]);
		expect(response.status()).toBe(201);
		const created = await response.json() as { station_id?: string; id?: string };
		newStationId = created.station_id ?? created.id ?? '';
		expect(newStationId).toMatch(/^[0-9a-f-]{36}$/u);
		await expect(page.getByRole('heading', { name: newStationName, exact: true })).toBeVisible();
	});

	test('S6.3 the Owner updates organization details', async ({ page }) => {
		await loginAsOwner(page);
		await page.getByRole('link', { name: 'Organisasi', exact: true }).click();
		await expect(page.getByRole('heading', { name: 'Organisasi', exact: true })).toBeVisible();
		const legalName = page.getByLabel('Nama badan hukum');
		await legalName.fill('PT PomKita Demo Integrasi');
		const [response] = await Promise.all([
			page.waitForResponse((item) => item.request().method() === 'PATCH' && item.url().includes('/organizations/')),
			page.getByRole('button', { name: 'Simpan organisasi' }).click()
		]);
		expect(response.status()).toBe(200);
		await expect(page.getByRole('status')).toHaveText('Perubahan organisasi disimpan.');
		await expect(legalName).toHaveValue('PT PomKita Demo Integrasi');
		await expect(page.getByRole('button', { name: /Nonaktifkan organisasi/u })).toHaveCount(0);
	});

	test('S6.4 the Owner invites an Operator for the new station', async ({ page }) => {
		await loginAsOwner(page);
		await page.getByRole('link', { name: 'Pengguna', exact: true }).click();
		await expect(page.getByRole('heading', { name: 'Pengguna dan peran' })).toBeVisible();
		await expect(page.getByRole('option', { name: 'Owner', exact: true })).toHaveCount(0);
		await page.locator('#user-email').fill(invitedEmail);
		await page.locator('#user-display-name').fill(invitedDisplayName);
		await page.locator('#user-role').selectOption('Operator');
		await page.locator('#user-station').fill(newStationId);
		await page.getByRole('button', { name: 'Kirim undangan' }).click();
		await expect(page.getByRole('status')).toHaveText('Undangan berhasil dikirim.');
		await expect(page.getByText(invitedDisplayName, { exact: true })).toBeVisible();
	});

	test('S6.5 the test reads the activation link', async () => {
		activationLink = await activationLinkFor(invitedEmail);
		const link = new URL(activationLink);
		expect(link.pathname).toBe('/aktivasi');
		expect(link.searchParams.has('token')).toBe(true);
	});

	test('S6.6 the invited user activates the account', async ({ page }) => {
		await page.goto(activationLink);
		await expect(page.getByRole('heading', { name: 'Aktivasi akun' })).toBeVisible();
		await page.getByLabel('Nama pengguna').fill(invitedCredentials.username);
		await page.getByLabel('Kata sandi').fill(invitedCredentials.password);
		await page.getByLabel('Nama lengkap').fill(invitedDisplayName);
		const [response] = await Promise.all([
			page.waitForResponse((item) => item.request().method() === 'POST' && /\/api\/v1\/auth\/invitations\/accept$/u.test(item.url())),
			page.getByRole('button', { name: 'Aktifkan akun' }).click()
		]);
		expect(response.status()).toBe(204);
		await expect(page).toHaveURL(/\/masuk$/u);
	});

	test('S6.7 the invited user signs in', async ({ page }) => {
		await login(page, invitedCredentials);
		await expect(page.getByRole('heading', { name: 'Beranda' })).toBeVisible();
	});

	test('S6.8 the Owner changes the user role to Supervisor', async ({ page }) => {
		await loginAsOwner(page);
		await page.getByRole('link', { name: 'Pengguna', exact: true }).click();
		await page.getByRole('button', { name: `Lihat ${invitedDisplayName}` }).click();
		await expect(page.getByRole('heading', { name: invitedDisplayName })).toBeVisible();
		const roleEditor = page.getByRole('region', { name: 'Peran pengguna' });
		const operatorRole = roleEditor.locator('li').filter({ hasText: 'Operator' });
		await Promise.all([
			page.waitForResponse((item) => item.request().method() === 'DELETE' && /\/roles$/u.test(item.url())),
			operatorRole.getByRole('button', { name: 'Hapus' }).click()
		]);
		await page.getByRole('button', { name: '← Kembali ke pengguna' }).click();
		await page.reload();
		await page.getByRole('button', { name: `Lihat ${invitedDisplayName}` }).click();
		await expect(page.getByRole('heading', { name: 'Peran pengguna' })).toBeVisible();
		await page.locator('#role-name').selectOption('Supervisor');
		await page.locator('#role-station').fill(newStationId);
		await Promise.all([
			page.waitForResponse((item) => item.request().method() === 'POST' && /\/roles$/u.test(item.url())),
			page.getByRole('button', { name: 'Tambah peran' }).click()
		]);
		await page.getByRole('button', { name: '← Kembali ke pengguna' }).click();
		await page.reload();
		await page.getByRole('button', { name: `Lihat ${invitedDisplayName}` }).click();
		const assignedRole = page.getByRole('region', { name: 'Peran pengguna' }).locator('ul li').filter({ hasText: 'Supervisor' });
		await expect(assignedRole).toHaveCount(1);
		await expect(assignedRole).toContainText(newStationName);
	});

	test('S6.9 the Owner reads the user role history', async ({ page }) => {
		await loginAsOwner(page);
		await page.getByRole('link', { name: 'Pengguna', exact: true }).click();
		await page.getByRole('button', { name: `Lihat ${invitedDisplayName}` }).click();
		const history = page.getByRole('region', { name: 'Riwayat peran' });
		await expect(history).toBeVisible();
		const supervisorEvent = history.locator('tbody tr').filter({ hasText: newStationName }).filter({ hasText: 'Supervisor' });
		await expect(supervisorEvent).toHaveCount(1);
		await expect(supervisorEvent).toContainText('88888888-8888-4888-8888-888888888888');
		await expect(supervisorEvent).toContainText(/2026-\d{2}-\d{2}T/u);
	});

	test('S6.10 the Owner disables the new user', async ({ page }) => {
		await loginAsOwner(page);
		await page.getByRole('link', { name: 'Pengguna', exact: true }).click();
		await page.getByRole('button', { name: `Lihat ${invitedDisplayName}` }).click();
		await page.locator('#detail-enabled').uncheck();
		await Promise.all([
			page.waitForResponse((item) => item.request().method() === 'PATCH' && /\/users\/[0-9a-f-]+$/u.test(item.url())),
			page.getByRole('button', { name: 'Simpan perubahan' }).click()
		]);
		await expect(page.getByRole('status')).toHaveText('Perubahan pengguna disimpan.');
		await page.getByRole('button', { name: '← Kembali ke pengguna' }).click();
		await expect(page.locator('tr').filter({ hasText: invitedDisplayName }).getByText('Nonaktif', { exact: true })).toBeVisible();
	});
});
