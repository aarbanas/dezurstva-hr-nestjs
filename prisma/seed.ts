// prisma/seed.ts

import { PrismaClient, UserType } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  dotenv.config();
  const saltOrRounds = 10;
  const adminPassword = await bcrypt.hash(
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
  await prisma.user.upsert({
    where: { email: 'admin@babylon.com' },
    update: {},
    create: {
      email: 'admin@babylon.com',
      password: adminPassword,
      role: 'ADMIN',
      active: true,
      userAttributesId: userAttributes.id,
    },
  });

  // for (let i = 0; i < 20; i++) {
  //   const cities = ['Rijeka', 'Zagreb', 'Split', 'Ljubljana'];
  //   const _userAttr = await prisma.userAttributes.create({
  //     data: {
  //       firstname: `Test_${i + 1}`,
  //       lastname: `User_${i + 1}`,
  //       type: Object.values(UserType)[
  //         Math.floor(Math.random() * Object.values(UserType).length)
  //       ],
  //       city: cities[Math.floor(Math.random() * cities.length)],
  //     },
  //   });
  //
  //   const userPwd = await bcrypt.hash(
  //     Math.random().toString(36).slice(-8),
  //     saltOrRounds,
  //   );
  //   await prisma.user.create({
  //     data: {
  //       email: `test_${i + 1}@test.com`,
  //       password: userPwd,
  //       role: 'USER',
  //       active: true,
  //       userAttributesId: _userAttr.id,
  //     },
  //   });
  // }
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
