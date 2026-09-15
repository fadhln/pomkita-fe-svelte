import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/svelte';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';
import { resetAccountFixtures, resetShiftFixtures } from './mocks/handlers';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
	server.resetHandlers();
	resetAccountFixtures();
	resetShiftFixtures();
	cleanup();
});
afterAll(() => server.close());
