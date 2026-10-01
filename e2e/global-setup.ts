import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';

// Playwright starts the webServer and waits on `webServer.url` BEFORE running this
// globalSetup, so that readiness URL must be static (not DB-backed) — it currently
// points at /robots.txt. The `db` export in src/lib/server/db/index.ts is a lazy
// Proxy that only opens the SQLite file on first query, which happens during a
// test (after this migration runs), so there's no race as long as readiness stays
// static.
export default function globalSetup() {
	const db = 'data/e2e.db';
	for (const f of [db, `${db}-shm`, `${db}-wal`]) if (existsSync(f)) rmSync(f);
	execSync('npm run db:migrate', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: db } });
}
