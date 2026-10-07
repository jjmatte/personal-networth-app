import { defineConfig } from '@playwright/test';

const DATABASE_URL = 'data/e2e.db';
const PRICE_STUB_PORT = 4399;
const PRICE_API_BASE = `http://localhost:${PRICE_STUB_PORT}`;

export default defineConfig({
	testDir: './e2e',
	workers: 1,
	globalSetup: './e2e/global-setup.ts',
	use: { baseURL: 'http://localhost:4173' },
	webServer: [
		{
			// Deterministic offline price source; see e2e/price-stub.mjs.
			command: 'node e2e/price-stub.mjs',
			url: `${PRICE_API_BASE}/health`,
			reuseExistingServer: !process.env.CI,
			env: { PRICE_STUB_PORT: String(PRICE_STUB_PORT) }
		},
		{
			command: 'npm run build && npm run preview',
			url: 'http://localhost:4173/robots.txt',
			reuseExistingServer: !process.env.CI,
			// Price the app against the local stub so refreshes stay offline.
			env: { DATABASE_URL, TWELVE_DATA_API_KEY: 'e2e-key', PRICE_API_BASE }
		}
	]
});
