import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';
import Handlebars from 'handlebars';
import { templates } from './templates/templates';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class EmailService {
  readonly #logger = new Logger(EmailService.name);
  readonly #emailAddress: string;
  readonly nodeEnv: string;
  constructor(private readonly configService: ConfigService) {
    sgMail.setApiKey(this.configService.getOrThrow('SENDGRID_API_KEY'));
    this.#emailAddress = this.configService.getOrThrow('EMAIL_ADDRESS');
    this.nodeEnv = this.configService.getOrThrow('ENV');
  }

  async sendEmail(email: string, subject: string, content: string) {
    if (this.nodeEnv !== 'production') return;

    const msg = {
      to: email,
      from: this.#emailAddress,
      subject,
      html: content,
    };

    try {
      await sgMail.send(msg);
    } catch (e) {
      this.#logger.error(e);
      throw new BadRequestException();
    }
  }

  generateTemplate<T>(data: T, _template: keyof typeof templates): string {
    const templatePath = path.resolve(__dirname, templates[_template]);
    const templateFile = fs.readFileSync(templatePath, 'utf8');

    const template = Handlebars.compile(templateFile);

    return template(data);
  }
}
