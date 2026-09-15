import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Topbar from './Topbar.svelte';

const navigation = vi.hoisted(() => ({
	goto: vi.fn().mockResolvedValue(undefined),
	invalidateAll: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('$app/navigation', () => navigation);

afterEach(() => vi.clearAllMocks());

describe('Topbar', () => {
	it('places the account link near sign out', () => {
		render(Topbar);
		expect(screen.getByRole('link', { name: 'Akun' })).toHaveAttribute('href', '/akun');
	});

	it('logs out and returns to Masuk', async () => {
		render(Topbar);
		await fireEvent.click(screen.getByRole('button', { name: 'Keluar' }));

		await waitFor(() => expect(navigation.goto).toHaveBeenCalledWith('/masuk'));
		expect(navigation.invalidateAll).toHaveBeenCalled();
	});
});
