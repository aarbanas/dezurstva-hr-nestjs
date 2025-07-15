import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ITemplateStrategy } from './templateStrategies/ITemplateStrategy';
import {
  NotifyCustomerForCertificateUploadTemplateData,
  OrganisationRegisterTemplateData,
  UserRegisterTemplateData,
} from './templateStrategies/types';
import { UserRegisteredStrategy } from './templateStrategies/UserRegisteredStrategy';
import { OrganisationRegisteredStrategy } from './templateStrategies/OrganisationRegisteredStrategy';
import { AdminOrganisationRegisteredStrategy } from './templateStrategies/AdminOrganisationRegisteredStrategy';
import { ForgotPasswordStrategy } from './templateStrategies/ForgotPasswordStrategy';
import { OrganisationActivatedStrategy } from './templateStrategies/OrganisationActivatedStrategy';
import { AdminUserCertificateUploadedStrategy } from './templateStrategies/AdminUserCertificateUploadedStrategy';
import { AdminNotifyCustomerForCertificateUpload } from './templateStrategies/AdminNotifyCustomerForCertificateUpload';
import { Resend } from 'resend';
import { EmailCacheService } from '../../redis/email/email-cache.service';
import { EmailQueueData } from '../../redis/email/email-queue.service';

@Injectable({ scope: Scope.REQUEST })
export class EmailService {
  readonly #logger = new Logger(EmailService.name);
  readonly #emailAddress: string;
  private readonly nodeEnv: string;
  private strategy: ITemplateStrategy;
  private readonly resendClient: Resend;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailCacheService: EmailCacheService,
  ) {
    this.#emailAddress = this.configService.getOrThrow('EMAIL_ADDRESS');
    this.nodeEnv = this.configService.getOrThrow('ENV');
    this.resendClient = new Resend(
      this.configService.getOrThrow('RESEND_API_KEY'),
    );
  }

  async sendUserRegisterEmail(email: string, data: UserRegisterTemplateData) {
    this.setStrategy(new UserRegisteredStrategy());
    const template = this.getTemplate(data);

    return this.sendEmail(email, 'Uspješna registracija', template);
  }

  async sendOrganisationRegisterEmail(
    email: string,
    data: OrganisationRegisterTemplateData,
  ) {
    this.setStrategy(new OrganisationRegisteredStrategy());
    const template = this.getTemplate(data);

    return this.sendEmail(email, 'Uspješna registracija', template);
  }

  async sendResetPasswordEmail(email: string, data: UserRegisterTemplateData) {
    this.setStrategy(new ForgotPasswordStrategy());
    const template = this.getTemplate(data);

    return this.sendEmail(email, 'Zaboravljena lozinka', template);
  }

  async sendOrganisationActivatedEmail(
    email: string,
    data: UserRegisterTemplateData,
  ) {
    this.setStrategy(new OrganisationActivatedStrategy());
    const template = this.getTemplate(data);

    return this.sendEmail(email, 'Korisnički račun aktiviran', template);
  }

  async sendAdminOrganisationRegisterEmail(
    email: string,
    data: UserRegisterTemplateData,
  ) {
    this.setStrategy(new AdminOrganisationRegisteredStrategy());
    const template = this.getTemplate(data);

    return this.sendEmail(email, 'Nova registracija organizacije', template);
  }

  async sendAdminUserCertificateUploadedEmail(
    email: string,
    data: UserRegisterTemplateData,
  ) {
    this.setStrategy(new AdminUserCertificateUploadedStrategy());
    const template = this.getTemplate(data);

    return this.sendEmail(email, 'Novi certifikat je dodan', template);
  }

  async sendAdminNotifyCustomerForCertificateUploadEmail(
    email: string,
    data: NotifyCustomerForCertificateUploadTemplateData,
  ) {
    this.setStrategy(new AdminNotifyCustomerForCertificateUpload());
    const template = this.getTemplate(data);

    return this.sendEmail(
      email,
      'Podsjetnik: Potrebno je učitati certifikat za dovršetak registracije',
      template,
    );
  }

  async resendEmail(email: string, subject: string, content: string) {
    return this.sendEmail(email, subject, content);
  }

  private setStrategy(strategy: ITemplateStrategy) {
    this.strategy = strategy;
  }

  private async sendEmail(
    email: string,
    subject: string,
    content: string,
  ): Promise<void> {
    if (this.nodeEnv !== 'production') throw new ForbiddenException();

    const emailData: EmailQueueData = {
      to: email,
      subject,
      body: content,
    };
    const dailyEmailLimit =
      await this.emailCacheService.validateIfDailyLimitIsHitAndQueueItems(
        emailData,
      );
    if (dailyEmailLimit) {
      return;
    }

    const { error } = await this.resendClient.emails.send({
      from: this.#emailAddress,
      to: [emailData.to],
      subject: emailData.subject,
      html: emailData.body,
    });

    if (error) {
      this.#logger.error(error);
      throw new BadRequestException();
    }

    await this.emailCacheService.increaseEmailCount();
  }

  private getTemplate(
    data:
      | UserRegisterTemplateData
      | OrganisationRegisterTemplateData
      | NotifyCustomerForCertificateUploadTemplateData,
  ): string {
    return this.strategy.getTemplate(data);
  }
}
