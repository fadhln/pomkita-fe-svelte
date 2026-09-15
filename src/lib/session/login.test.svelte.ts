import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import LoginPage from '../../routes/masuk/+page.svelte';

const navigation = vi.hoisted(() => ({
	goto: vi.fn().mockResolvedValue(undefined),
	invalidateAll: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('$app/navigation', () => navigation);

afterEach(() => vi.clearAllMocks());

function fillLoginForm(username: string, password: string) {
	fireEvent.input(screen.getByLabelText('Nama pengguna'), { target: { value: username } });
	fireEvent.input(screen.getByLabelText('Kata Sandi'), { target: { value: password } });
}

describe('Masuk', () => {
	it('shows the required sign-in controls', () => {
		render(LoginPage);

		expect(screen.getByRole('heading', { name: 'Masuk' })).toBeInTheDocument();
		expect(screen.getByLabelText('Nama pengguna')).toBeRequired();
		expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
		expect(screen.getByLabelText('Kata Sandi')).toBeRequired();
		expect(screen.getByRole('button', { name: 'Masuk' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Lupa sandi?' })).toHaveAttribute('href', '/lupa-sandi');
	});

	it('shows the invalid-credential error', async () => {
		server.use(
			http.post(`${apiUrl}/login`, () =>
				HttpResponse.json({ type: 'https://example.com/problems/invalid-credentials', title: 'Unauthorized', status: 401, detail: 'Nama pengguna atau kata sandi salah.' }, { status: 401 })
			)
		);
		render(LoginPage);
		fillLoginForm('test.user', 'wrong-password');
		await fireEvent.submit(screen.getByRole('button', { name: 'Masuk' }).closest('form')!);

		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Nama pengguna atau kata sandi salah'));
	});

	it('invalidates the session and goes home after login', async () => {
		render(LoginPage);
		fillLoginForm('test.user', 'correct-password');
		await fireEvent.submit(screen.getByRole('button', { name: 'Masuk' }).closest('form')!);

		await waitFor(() => expect(navigation.goto).toHaveBeenCalledWith('/'));
		expect(navigation.invalidateAll).toHaveBeenCalled();
	});
});
