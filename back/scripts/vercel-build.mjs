import { execSync } from 'node:child_process';

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

// In Vercel, DATABASE_URL should be set and migrations should run.
// Locally, allow `npm run build` to work without requiring a database.
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim());
const isVercel = Boolean(process.env.VERCEL);
const forceMigrations = process.env.RUN_MIGRATIONS === '1' || process.env.RUN_MIGRATIONS === 'true';

if ((isVercel || forceMigrations) && hasDatabaseUrl) {
  run('npx prisma migrate deploy');
} else {
  console.warn('Skipping prisma migrate deploy (set VERCEL=1 on Vercel or RUN_MIGRATIONS=1 to force).');
}

run('next build');
