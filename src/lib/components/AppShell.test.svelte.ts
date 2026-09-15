import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import AppShell from './AppShell.svelte';

describe('AppShell', () => {
	it('renders the sidebar with Beranda visible', () => {
		render(AppShell, { session: { roles: ['Owner'] } });

		expect(screen.getByRole('link', { name: 'Beranda' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Akun' })).toHaveAttribute('href', '/akun');
		expect(screen.getByRole('link', { name: 'Organisasi' })).toHaveAttribute('href', '/organisasi');
		expect(screen.getByRole('link', { name: 'Stasiun' })).toHaveAttribute('href', '/stasiun');
	});

	it('hides organization links for an operator', () => {
		render(AppShell, { session: { roles: ['Operator'] } });

		expect(screen.queryByRole('link', { name: 'Organisasi' })).not.toBeInTheDocument();
		expect(screen.queryByRole('link', { name: 'Stasiun' })).not.toBeInTheDocument();
	});
});
