import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ForgotPasswordForm from './ForgotPasswordForm.svelte';

describe('forgot password form', () => {
	it('accepts a username or email and shows the privacy-safe success message', async () => {
		render(ForgotPasswordForm);
		const identifier = screen.getByLabelText('Nama pengguna atau alamat email');
		expect(identifier).toBeRequired();
		fireEvent.input(identifier, { target: { value: 'budi@example.com' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Kirim tautan atur ulang' }));

		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Jika akun itu ada, kami sudah mengirim tautan atur ulang.'));
	});
});
