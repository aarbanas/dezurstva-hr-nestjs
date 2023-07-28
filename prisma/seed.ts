// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  dotenv.config();
  const saltOrRounds = 10;
  const password = await bcrypt.hash(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    process.env.ADMIN_PASSWORD!,
    saltOrRounds,
  );
  const userAttributes = await prisma.userAttributes.upsert({
    where: { id: 1 },
    update: {},
    create: {
      firstname: 'Fero',
      lastname: 'God',
      city: 'Ljubljana',
    },
  });
  // create admin user
  const user = await prisma.user.upsert({
    where: { email: 'admin@babylon.com' },
    update: {},
    create: {
      email: 'admin@babylon.com',
      password,
      role: 'ADMIN',
      active: true,
      userAttributesId: userAttributes.id,
    },
  });

  console.log(user);
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
