import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@sendgrid/mail';
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

const sendgridClient = new MailService();

@Injectable({ scope: Scope.REQUEST })
export class EmailService {
  readonly #logger = new Logger(EmailService.name);
  readonly #emailAddress: string;
  readonly nodeEnv: string;
  private strategy: ITemplateStrategy;

  constructor(private readonly configService: ConfigService) {
    sendgridClient.setApiKey(this.configService.getOrThrow('SENDGRID_API_KEY'));
    this.#emailAddress = this.configService.getOrThrow('EMAIL_ADDRESS');
    this.nodeEnv = this.configService.getOrThrow('ENV');
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

  private setStrategy(strategy: ITemplateStrategy) {
    this.strategy = strategy;
  }

  private async sendEmail(email: string, subject: string, content: string) {
    if (this.nodeEnv !== 'production') throw new ForbiddenException();

    const msg = {
      to: email,
      from: this.#emailAddress,
      subject,
      html: content,
    };

    try {
      await sendgridClient.send(msg);
    } catch (e) {
      this.#logger.error(e);
      throw new BadRequestException();
    }
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
