/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { User, UserAttributes } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ICreateStrategy } from './icreate.strategy';
import { EmailService } from '../../notification/email/email.service';
import { ConfigService } from '@nestjs/config';

export class CreateUserStrategy implements ICreateStrategy {
  readonly #appName: string;
  readonly #appUrl: string;
  constructor(
    private prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.#appName = this.configService.getOrThrow('APP_NAME');
    this.#appUrl = this.configService.getOrThrow('APP_URL');
  }
  async create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'> | undefined> {
    const userAttributes: Omit<UserAttributes, 'id'> = {
      city: createUserDto.city,
      firstname: createUserDto.firstname!,
      lastname: createUserDto.lastname!,
      phone: createUserDto.phone!,
      type: createUserDto.type!,
    };
    const user = await this.prismaService.$transaction(async (tx) => {
      // 1. Create user attributes
      const _userAttributes = await tx.userAttributes.create({
        data: userAttributes,
      });

      // 2. Create user
      return tx.user.create({
        data: {
          email: createUserDto.email,
          password: createUserDto.password,
          role: createUserDto.role,
          userAttributesId: _userAttributes.id,
          termsAndConditionsAccepted: createUserDto.termsAndConditions,
        },
      });
    });

    await this.emailService.sendUserRegisterEmail(user.email, {
      appName: this.#appName,
      userEmail: user.email,
      link: `${this.#appUrl}/profile/certificates`,
      year: new Date().getFullYear(),
    });

    return user;
  }
}
