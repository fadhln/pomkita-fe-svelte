import { expect, test } from '@playwright/test';
import { createSubmittedShift, loginAsAdmin, loginAsOwner, loginAsSupervisor, openNewShift, resetToSeed, submitExistingShift } from './support';

test.beforeEach(() => resetToSeed());

test('S5.1 login reaches the authenticated home page', async ({ page }) => {
	await loginAsSupervisor(page);
	await expect(page).toHaveURL(/\/$/u);
	await expect(page.getByRole('heading', { name: 'Beranda' })).toBeVisible();
	await expect(page.getByLabel('Navigasi utama')).toContainText('Shift');
});

test('S5.2 opens a shift, writes one reading and sale, then submits', async ({ page, request }) => {
	await openNewShift(page);
	const shiftId = page.url().match(/\/shift\/([0-9a-f-]+)$/u)?.[1];
	expect(shiftId).toBeTruthy();
	await submitExistingShift(request, shiftId!);
	await expect(page.getByText('Klaim draft aktif', { exact: true })).toBeVisible();
	await page.getByRole('link', { name: 'Shift', exact: true }).click();
	await expect(page.getByText('Diproses', { exact: true })).toBeVisible();
});

test('S5.3 the shift list shows a submitted shift', async ({ page, request }) => {
	await createSubmittedShift(request);
	await loginAsSupervisor(page);
	await page.getByRole('link', { name: 'Shift', exact: true }).click();
	await expect(page.getByText('Diproses', { exact: true })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Input shift' }).first()).toBeVisible();
});

test('S5.4 governance queue reads a pending amendment and rejects it', async ({ page }) => {
	await loginAsAdmin(page);
	await page.getByRole('link', { name: 'Tata kelola' }).click();
	await expect(page.getByText('Antrean amendemen', { exact: true })).toBeVisible();
	await expect(page.getByText('Koreksi nilai penjualan untuk pemeriksaan integrasi.', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'Tolak' }).click();
	await page.getByLabel(/Alasan penolakan/).fill('Nilai sudah benar.');
	await page.getByRole('button', { name: 'Kirim penolakan' }).click();
	await expect(page.getByText('Tidak ada amendemen menunggu.', { exact: true })).toBeVisible();
});

test('S5.5 laporan detail reads the submitted reading and sale', async ({ page, request }) => {
	const submitted = await createSubmittedShift(request);
	await loginAsSupervisor(page);
	await page.getByRole('link', { name: 'Laporan' }).click();
	await page.locator(`a[href="/laporan/${submitted.reportId}"]`).click();
	await expect(page.getByRole('heading', { name: 'Detail laporan' })).toBeVisible();
	await expect(page.getByText('Pembacaan meter')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Penjualan', exact: true })).toBeVisible();
	await expect(page.getByText('100.0', { exact: true })).toBeVisible();
	await expect(page.locator('section[aria-labelledby="sales-title"]').getByRole('cell', { name: '10000', exact: true })).toBeVisible();
});

test('S5.6 audit list reads live submission events', async ({ page, request }) => {
	await createSubmittedShift(request);
	await loginAsOwner(page);
	await page.getByRole('link', { name: 'Audit' }).click();
	await expect(page.getByRole('heading', { name: 'Audit', exact: true })).toBeVisible();
	await expect(page.getByText('Rantai audit terverifikasi', { exact: true })).toBeVisible();
	await expect(page.locator('tbody tr')).not.toHaveCount(0);
});
