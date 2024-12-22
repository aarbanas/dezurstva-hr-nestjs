/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ICreateStrategy } from './icreate.strategy';
import { CreateUserDto } from '../dto/create-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganisationAttributes, User } from '@prisma/client';
import { EmailService } from '../../notification/email/email.service';

export class CreateOrganisationStrategy implements ICreateStrategy {
  constructor(
    private prismaService: PrismaService,
    private readonly emailService: EmailService,
  ) {}
  async create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'> | undefined> {
    const organisationAttributes: Omit<OrganisationAttributes, 'id'> = {
      city: createUserDto.city,
      name: createUserDto.name!,
      oib: createUserDto.oib!,
      street: createUserDto.street!,
    };
    const org = await this.prismaService.$transaction(async (tx) => {
      const _organisationAttributes = await tx.organisationAttributes.create({
        data: organisationAttributes,
      });

      return tx.user.create({
        data: {
          email: createUserDto.email,
          password: createUserDto.password,
          role: createUserDto.role,
          organisationAttributesId: _organisationAttributes.id,
          termsAndConditionsAccepted: createUserDto.termsAndConditions,
        },
      });
    });

    const template = this.emailService.generateTemplate(
      {
        appName: 'Dežurstva',
        userEmail: org.email,
        link: 'https://dezurstva.com/profile/certificates',
        year: new Date().getFullYear(),
      },
      'ORGANISATION_REGISTER',
    );

    await this.emailService.sendEmail(
      'dezurstva.com@gmail.com',
      'Uspješna registracija',
      template,
    );

    return org;
  }
}
