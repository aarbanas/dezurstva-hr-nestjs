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
import { ForgotPasswordStrategy } from './templateStrategies/ForgotPasswordStrategy';
import { OrganisationActivatedStrategy } from './templateStrategies/OrganisationActivatedStrategy';
import { AdminNotifyCustomerForCertificateUpload } from './templateStrategies/AdminNotifyCustomerForCertificateUpload';
import { Resend } from 'resend';
import { EmailCacheService } from '../../redis/email/email-cache.service';
import {
  EmailQueueData,
  EmailQueueService,
} from '../../redis/email/email-queue.service';
import { ApologyEmailForRegistrationWithIssues } from './templateStrategies/ApologyEmailForRegistrationWithIssues';
import { DiscordQueueEvent } from '../../events/discord.events';
import { EventEmitter2 } from '@nestjs/event-emitter';

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
    private readonly eventEmitter: EventEmitter2,
    private readonly emailQueueService: EmailQueueService,
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

  async sendApologyUponRegistration(
    email: string,
    data: UserRegisterTemplateData,
  ) {
    this.setStrategy(new ApologyEmailForRegistrationWithIssues());
    const template = this.getTemplate(data);

    return this.sendEmail(
      email,
      'Isprika zbog prekida rada sustava — sustav ponovno dostupan',
      template,
    );
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

  async resendEmail(emailData: EmailQueueData): Promise<void> {
    const { to, subject, body } = emailData;
    await this.sendEmail(to, subject, body);

    await this.emailQueueService.deleteItemFromQueue(emailData);
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
      if (error.name === 'rate_limit_exceeded') {
        this.eventEmitter.emit(
          'discord.queue',
          new DiscordQueueEvent(
            `⏱️ Rate limit exceeded in Resend. Email will be queued for later processing.`,
          ),
        );
        await this.emailCacheService.enqueueEmail(emailData);
        return;
      }

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
