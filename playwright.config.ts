import { defineConfig } from '@playwright/test';

const DATABASE_URL = 'data/e2e.db';

export default defineConfig({
	testDir: './e2e',
	workers: 1,
	globalSetup: './e2e/global-setup.ts',
	use: { baseURL: 'http://localhost:4173' },
	webServer: {
		command: 'npm run build && npm run preview',
		url: 'http://localhost:4173/robots.txt',
		reuseExistingServer: !process.env.CI,
		env: { DATABASE_URL }
	}
});
