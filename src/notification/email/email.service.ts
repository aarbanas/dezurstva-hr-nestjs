import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as sendgrid from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  readonly #logger = new Logger(EmailService.name);
  readonly #emailAddress: string;
  constructor(private readonly configService: ConfigService) {
    sendgrid.setApiKey(this.configService.getOrThrow('SENDGRID_API_KEY'));
    this.#emailAddress = this.configService.getOrThrow('EMAIL_ADDRESS');
  }

  async sendEmail(email: string, subject: string, content: string) {
    const msg = {
      to: email,
      from: this.#emailAddress,
      subject,
      html: content,
    };

    try {
      await sendgrid.send(msg);
    } catch (e) {
      this.#logger.error(e);
      throw new BadRequestException();
    }
  }
}
