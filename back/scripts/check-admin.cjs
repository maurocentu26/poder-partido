/* eslint-disable @typescript-eslint/no-require-imports */
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@local').replace(/^"|"$/g, '');
  const pass = (process.env.ADMIN_PASSWORD || 'admin123').replace(/^"|"$/g, '');

  const prisma = new PrismaClient();

  const user = await prisma.user.findUnique({ where: { email } });

  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('ADMIN_EMAIL:', email);
  console.log('User exists:', Boolean(user));

  if (user) {
    const ok = await bcrypt.compare(pass, user.passwordHash);
    console.log('Password matches ADMIN_PASSWORD:', ok);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
