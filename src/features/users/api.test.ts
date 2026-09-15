import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../../test/mocks/handlers';
import { server } from '../../../test/mocks/server';
import { addUserRole, createUser, getRoleHistory, getUser, getUsers, removeUserRole, resetUserPassword, updateUser } from './api';

describe('users API', () => {
	it('reads the permitted list and sends the Superadmin organization scope', async () => {
		let query = '';
		server.use(http.get(`${apiUrl}/users`, ({ request }) => {
			query = new URL(request.url).search;
			return HttpResponse.json([{ id: 'user-1', email: 'operator@example.com', display_name: 'Operator', username: null, enabled: true, roles: [] }]);
		}));

		await expect(getUsers()).resolves.toHaveLength(1);
		await expect(getUsers('org-2')).resolves.toHaveLength(1);
		expect(query).toBe('?org_id=org-2');
	});

	it('uses the invite, detail, role, history, patch, and reset contracts', async () => {
		let bodies: unknown[] = [];
		server.use(
			http.post(`${apiUrl}/users`, async ({ request }) => { bodies.push(await request.json()); return HttpResponse.json({ id: 'user-2' }, { status: 201 }); }),
			http.get(`${apiUrl}/users/user-2`, () => HttpResponse.json({ id: 'user-2', roles: [], stations: [] })),
			http.patch(`${apiUrl}/users/user-2`, async ({ request }) => { bodies.push(await request.json()); return HttpResponse.json({ id: 'user-2' }); }),
			http.post(`${apiUrl}/users/user-2/roles`, async ({ request }) => { bodies.push(await request.json()); return HttpResponse.json({ roles: [] }); }),
			http.delete(`${apiUrl}/users/user-2/roles`, async ({ request }) => { bodies.push(await request.json()); return new HttpResponse(null, { status: 204 }); }),
			http.get(`${apiUrl}/users/user-2/role-history`, () => HttpResponse.json([{ sequence: 1 }])),
			http.post(`${apiUrl}/users/user-2/password-reset`, () => HttpResponse.json({ link: 'https://example.test/reset/token' }))
		);

		await createUser({ email: 'operator@example.com', display_name: 'Operator', role: 'Operator', station_id: 'station-1' });
		await expect(getUser('user-2')).resolves.toMatchObject({ id: 'user-2' });
		await updateUser('user-2', { display_name: 'Operator Baru', enabled: false });
		await addUserRole('user-2', { station_id: 'station-1', role: 'Supervisor' });
		await removeUserRole('user-2', { station_id: 'station-1', role: 'Supervisor' });
		await expect(getRoleHistory('user-2')).resolves.toHaveLength(1);
		await expect(resetUserPassword('user-2')).resolves.toEqual({ link: 'https://example.test/reset/token' });

		expect(bodies).toEqual([
			{ email: 'operator@example.com', display_name: 'Operator', role: 'Operator', station_id: 'station-1' },
			{ display_name: 'Operator Baru', enabled: false },
			{ station_id: 'station-1', role: 'Supervisor' },
			{ station_id: 'station-1', role: 'Supervisor' }
		]);
	});
});
