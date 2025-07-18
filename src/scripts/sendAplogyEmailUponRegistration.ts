import { bootstrapApp } from './bootstrapApp';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notification/email/email.service';
import { ConfigService } from '@nestjs/config';

(async () => {
  const app = await bootstrapApp();
  const prismaService = await app.resolve(PrismaService);
  const emailService = await app.resolve(EmailService);
  const configService = await app.resolve(ConfigService);

  const appName = configService.getOrThrow('APP_NAME');
  const appUrl = configService.getOrThrow('APP_URL');

  const certificates = await prismaService.certificate.findMany({});
  const certificateUserAttributesIds = certificates?.length
    ? certificates.map((c) => c.userAttributeId!)
    : [];

  const usersMissingCertificates = await prismaService.user.findMany({
    where: {
      userAttributes: {
        id: {
          notIn: certificateUserAttributesIds,
        },
      },
    },
    orderBy: {
      id: 'asc',
    },
  });

  if (!usersMissingCertificates.length) {
    console.log(`No users found without certificates. Nothing to do.`);
    return;
  }

  const idsToRepeat = [
    17, 22, 35, 41, 47, 53, 82, 87, 93, 98, 108, 115, 119, 123, 126, 139, 151,
    157, 164, 184, 191, 200,
  ];
  for (const user of usersMissingCertificates) {
    if (!idsToRepeat.includes(user.id)) {
      continue;
    }

    try {
      await emailService.sendApologyUponRegistration(user.email, {
        appName,
        link: `${appUrl}/profile/certificates`,
        userEmail: user.email,
        year: new Date().getFullYear(),
      });
      console.log(`Sent apology email to user: ${user.id}`);
    } catch (error) {
      console.error(`Failed to send email to user ${user.id}:`, error);
    }
  }
})();
