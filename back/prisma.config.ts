import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node prisma/seed.cjs',
  },
  datasource: {
    url: env('DATABASE_URL'),
    // Recommended for providers like Supabase when DATABASE_URL points to a pooler.
    // Prisma Migrate works best with a direct connection.
    directUrl: process.env.DIRECT_URL ? env('DIRECT_URL') : undefined,
  },
});
