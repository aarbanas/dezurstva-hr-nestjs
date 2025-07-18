import { EmailQueueData } from '../redis/email/email-queue.service';

export class ResendEmailEvent {
  constructor(public readonly emailData: EmailQueueData) {}
}
