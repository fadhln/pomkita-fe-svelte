import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import AppShell from './AppShell.svelte';

describe('AppShell', () => {
	it('renders the sidebar with Beranda visible', () => {
		render(AppShell);

		expect(screen.getByRole('link', { name: 'Beranda' })).toBeInTheDocument();
	});
});
