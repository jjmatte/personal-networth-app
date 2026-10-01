import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';

export default function globalSetup() {
	const db = 'data/e2e.db';
	for (const f of [db, `${db}-shm`, `${db}-wal`]) if (existsSync(f)) rmSync(f);
	execSync('npm run db:migrate', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: db } });
}
