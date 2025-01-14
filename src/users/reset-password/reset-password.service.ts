import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes, createHash } from 'crypto';
import { EmailService } from '../../notification/email/email.service';
import { ConfigService } from '@nestjs/config';
import { BcryptService } from '../../service/bcrypt.service';

@Injectable()
export class ResetPasswordService {
  readonly #FIFTEENTH_MINUTES = 15 * 60 * 1000;
  readonly #appName: string;
  readonly #appUrl: string;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly bcryptService: BcryptService,
  ) {
    this.#appName = this.configService.getOrThrow('APP_NAME');
    this.#appUrl = this.configService.getOrThrow('APP_URL');
  }

  async forgotPassword(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (!user) {
      return;
    }

    const token = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(token).digest('hex');

    await this.prismaService.passwordResetToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        tokenExpiry: new Date(Date.now() + this.#FIFTEENTH_MINUTES).getTime(),
      },
    });

    await this.emailService.sendResetPasswordEmail(email, {
      appName: this.#appName,
      userEmail: email,
      link: `${this.#appUrl}/reset-password?token=${token}`,
      year: new Date().getFullYear(),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = createHash('sha256').update(token).digest('hex');

    const passwordResetToken =
      await this.prismaService.passwordResetToken.findFirst({
        where: {
          token: hashedToken,
          tokenExpiry: {
            gte: new Date().getTime(),
          },
        },
      });

    if (!passwordResetToken) {
      return new NotFoundException();
    }

    const password = await this.bcryptService.hashPassword(newPassword);

    await this.prismaService.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: passwordResetToken.userId,
        },
        data: {
          password,
          updatedAt: new Date(),
        },
      });

      return tx.passwordResetToken.delete({
        where: {
          userId: passwordResetToken.userId,
          token: hashedToken,
        },
      });
    });
  }
}
