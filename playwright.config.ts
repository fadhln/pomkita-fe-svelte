import { defineConfig, devices } from '@playwright/test';

const integrationProjectRequested = process.argv.some((argument) => argument === '--project=integration');
const feUrl = process.env.S5_FE_URL ?? `http://localhost:${process.env.S5_FE_PORT ?? '3100'}`;

export default defineConfig({
	testDir: './test/e2e',
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? 'line' : 'html',
	use: {
		baseURL: feUrl,
		trace: 'on-first-retry'
	},
	webServer: integrationProjectRequested ? {
		command: 'sh scripts/it-web-server.sh',
		url: `${feUrl}/masuk`,
		timeout: 180_000,
		reuseExistingServer: true
	} : {
		command: 'npm run dev -- --host 127.0.0.1 --port 4173',
		url: 'http://127.0.0.1:4173',
		reuseExistingServer: !process.env.CI
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{
			name: 'integration',
			testDir: './test/e2e-integration',
			timeout: 90_000,
			workers: 1,
			use: { ...devices['Desktop Chrome'], baseURL: feUrl }
		}
	]
});
