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

function fillLoginForm(email: string, password: string) {
	fireEvent.input(screen.getByLabelText('Email'), { target: { value: email } });
	fireEvent.input(screen.getByLabelText('Kata Sandi'), { target: { value: password } });
}

describe('Masuk', () => {
	it('shows the required sign-in controls', () => {
		render(LoginPage);

		expect(screen.getByRole('heading', { name: 'Masuk' })).toBeInTheDocument();
		expect(screen.getByLabelText('Email')).toBeRequired();
		expect(screen.getByLabelText('Kata Sandi')).toBeRequired();
		expect(screen.getByRole('button', { name: 'Masuk' })).toBeInTheDocument();
	});

	it('shows the invalid-credential error', async () => {
		server.use(
			http.post(`${apiUrl}/login`, () =>
				HttpResponse.json({ type: 'https://example.com/problems/invalid-credentials', title: 'Unauthorized', status: 401, detail: 'Email atau kata sandi salah.' }, { status: 401 })
			)
		);
		render(LoginPage);
		fillLoginForm('user@example.com', 'wrong-password');
		await fireEvent.submit(screen.getByRole('button', { name: 'Masuk' }).closest('form')!);

		await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Email atau kata sandi salah'));
	});

	it('invalidates the session and goes home after login', async () => {
		render(LoginPage);
		fillLoginForm('user@example.com', 'correct-password');
		await fireEvent.submit(screen.getByRole('button', { name: 'Masuk' }).closest('form')!);

		await waitFor(() => expect(navigation.goto).toHaveBeenCalledWith('/'));
		expect(navigation.invalidateAll).toHaveBeenCalled();
	});
});
