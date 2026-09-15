import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit(), svelteTesting({ autoCleanup: false })],
	test: {
		environment: 'jsdom',
		setupFiles: ['./test/setup.ts'],
		include: ['src/**/*.test.ts', 'src/**/*.test.svelte.ts'],
		clearMocks: true,
		restoreMocks: true
	}
});
