import { cleanup, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import AppShell from './AppShell.svelte';

describe('AppShell user navigation', () => {
	it('shows Pengguna only for Owner and Superadmin', () => {
		render(AppShell, { session: { roles: ['Owner'] } });
		expect(screen.getByRole('link', { name: 'Pengguna' })).toHaveAttribute('href', '/pengaturan/pengguna');

		cleanup();
		render(AppShell, { session: { roles: ['Operator'] } });
		expect(screen.queryAllByRole('link', { name: 'Pengguna' })).toHaveLength(0);
	});
});
