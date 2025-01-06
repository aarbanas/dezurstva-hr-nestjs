/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ICreateStrategy } from './icreate.strategy';
import { CreateUserDto } from '../dto/create-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganisationAttributes, User } from '@prisma/client';
import { EmailService } from '../../notification/email/email.service';
import { ConfigService } from '@nestjs/config';
import {
  OrganisationRegisterTemplateData,
  UserRegisterTemplateData,
} from '../../notification/email/templates/types';

export class CreateOrganisationStrategy implements ICreateStrategy {
  readonly #appName: string;
  readonly #appUrl: string;
  readonly #bankName: string;
  readonly #accountNumber: string;
  readonly #iban: string;
  readonly #swift: string;
  readonly #amount: string;
  readonly #adminEmail: string;
  constructor(
    private prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.#appName = this.configService.getOrThrow('APP_NAME');
    this.#appUrl = this.configService.getOrThrow('APP_URL');
    this.#bankName = this.configService.getOrThrow('BANK_NAME');
    this.#accountNumber = this.configService.getOrThrow('BANK_ACCOUNT');
    this.#iban = this.configService.getOrThrow('BANK_IBAN');
    this.#swift = this.configService.getOrThrow('BANK_SWIFT');
    this.#amount = this.configService.getOrThrow('AMOUNT');
    this.#adminEmail = this.configService.getOrThrow('ADMIN_EMAIL_ADDRESS');
  }
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

    await this.sendEmails(org.email, org.id);

    return org;
  }

  private async sendEmails(email: string, id: number): Promise<void> {
    // Send emails
    const orgRegisterTemplate =
      this.emailService.generateTemplate<OrganisationRegisterTemplateData>(
        {
          appName: this.#appName,
          userEmail: email,
          bankName: this.#bankName,
          accountNumber: this.#accountNumber,
          iban: this.#iban,
          swift: this.#swift,
          amount: this.#amount,
          year: new Date().getFullYear(),
        },
        'ORGANISATION_REGISTER',
      );

    const adminOrgRegisterTemplate =
      this.emailService.generateTemplate<UserRegisterTemplateData>(
        {
          appName: this.#appName,
          userEmail: email,
          link: `${this.#appUrl}/admin/organisations/profile/${id}`,
          year: new Date().getFullYear(),
        },
        'ADMIN_ORGANISATION_REGISTER',
      );

    await this.emailService.sendEmail(
      email,
      'Uspješna registracija',
      orgRegisterTemplate,
    );

    await this.emailService.sendEmail(
      this.#adminEmail,
      'Nova registracija organizacije',
      adminOrgRegisterTemplate,
    );
  }
}
