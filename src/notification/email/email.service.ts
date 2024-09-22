import { BadRequestException, Injectable } from '@nestjs/common';
import * as sendgrid from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  readonly #emailAddress: string;
  constructor(private readonly configService: ConfigService) {
    const sendgridApiKey = this.configService.get('SENDGRID_API_KEY');
    const email = this.configService.get('EMAIL_ADDRESS');
    if (!sendgridApiKey) {
      throw new Error('SENDGRID_API_KEY not found in environment variables');
    }
    if (!email) {
      throw new Error('EMAIL_ADDRESS not found in environment variables');
    }

    sendgrid.setApiKey(sendgridApiKey);
    this.#emailAddress = email;
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
      throw new BadRequestException();
    }
  }
}
