import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/** Defaults match requested credentials; override with SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD in .env for production. */
const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL ?? 'superadmin@gmail.com';
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD ?? 'Admin@123';
const BCRYPT_ROUNDS = 12;

/** Stable slug for seed upsert only (single-salon deployment). */
const SEEDED_SALON_SLUG = 'main';

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

  const salon = await prisma.salon.upsert({
    where: { slug: SEEDED_SALON_SLUG },
    create: {
      name: 'Main Salon',
      slug: SEEDED_SALON_SLUG,
      status: 'ACTIVE',
    },
    update: {
      name: 'Main Salon',
      status: 'ACTIVE',
    },
  });

  let category = await prisma.serviceCategory.findFirst({
    where: { salonId: salon.id, name: 'General' },
  });
  if (!category) {
    category = await prisma.serviceCategory.create({
      data: { salonId: salon.id, name: 'General', sortOrder: 0 },
    });
  }

  const existingService = await prisma.service.findFirst({
    where: { salonId: salon.id, name: 'Appointment' },
  });
  if (!existingService) {
    await prisma.service.create({
      data: {
        salonId: salon.id,
        branchId: null,
        categoryId: category.id,
        name: 'Appointment',
        description: 'Default service — edit or add more under Services.',
        durationMinutes: 30,
        priceCents: 0,
        isActive: true,
      },
    });
  }

  console.log(`Salon upserted: "${salon.name}" (public signups attach to the only salon in the database)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
