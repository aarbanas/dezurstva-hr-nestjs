import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ResendEmailEvent } from '../events/resend-email.event';
import { EmailService } from '../notification/email/email.service';

@Injectable()
export class ResendEmailListener {
  constructor(private readonly emailService: EmailService) {}

  @OnEvent('resend.email')
  async handleUserCreatedEvent(event: ResendEmailEvent) {
    return this.emailService.resendEmail(event.emailData);
  }
}
