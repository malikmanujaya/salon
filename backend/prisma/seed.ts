import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/** Defaults match requested credentials; override with SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD in .env for production. */
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL ?? 'superadmin@gmail.com';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD ?? 'Admin@123';
const BCRYPT_ROUNDS = 12;

async function main() {
  const passwordHash = await bcrypt.hash(SUPERADMIN_PASSWORD, BCRYPT_ROUNDS);

  await prisma.user.upsert({
    where: { email: SUPERADMIN_EMAIL.toLowerCase() },
    create: {
      email: SUPERADMIN_EMAIL.toLowerCase(),
      passwordHash,
      fullName: 'Super Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      salonId: null,
    },
    update: {
      passwordHash,
      fullName: 'Super Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      salonId: null,
    },
  });

  console.log(`Super admin upserted: ${SUPERADMIN_EMAIL} (role SUPER_ADMIN, no salon)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
