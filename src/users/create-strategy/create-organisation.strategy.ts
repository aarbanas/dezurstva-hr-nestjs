/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ICreateStrategy } from './icreate.strategy';
import { CreateUserDto } from '../dto/create-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganisationAttributes, User } from '@prisma/client';
import { EmailService } from '../../notification/email/email.service';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DiscordAdminInfoEvent } from '../../events/discord.events';

export class CreateOrganisationStrategy implements ICreateStrategy {
  readonly #appName: string;
  readonly #appUrl: string;
  readonly #bankName: string;
  readonly #accountNumber: string;
  readonly #iban: string;
  readonly #swift: string;
  readonly #amount: string;
  constructor(
    private prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.#appName = this.configService.getOrThrow('APP_NAME');
    this.#appUrl = this.configService.getOrThrow('APP_URL');
    this.#bankName = this.configService.getOrThrow('BANK_NAME');
    this.#accountNumber = this.configService.getOrThrow('BANK_ACCOUNT');
    this.#iban = this.configService.getOrThrow('BANK_IBAN');
    this.#swift = this.configService.getOrThrow('BANK_SWIFT');
    this.#amount = this.configService.getOrThrow('AMOUNT');
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
    await this.emailService.sendOrganisationRegisterEmail(email, {
      appName: this.#appName,
      userEmail: email,
      bankName: this.#bankName,
      accountNumber: this.#accountNumber,
      iban: this.#iban,
      swift: this.#swift,
      amount: this.#amount,
      year: new Date().getFullYear(),
    });

    this.eventEmitter.emit(
      'discord.admin.info',
      new DiscordAdminInfoEvent(
        `🏢Organisation ${email} with ID ${id} has successfully registered. Check the bank account details 
        and activate the account.`,
        [
          {
            title: 'Activate account',
            url: `${this.#appUrl}/admin/organisations/profile/${id}`,
            color: 0x0099ff,
          },
        ],
      ),
    );
  }
}
