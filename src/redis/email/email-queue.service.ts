import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResendEmailEvent } from '../../events/resend-email.event';

export type EmailQueueData = {
  to: string;
  subject: string;
  body: string;
};

@Injectable()
export class EmailQueueService {
  private readonly QUEUE_KEY = 'email_queue';

  constructor(
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async enqueueEmail(data: EmailQueueData) {
    await this.redisService.append(this.QUEUE_KEY, JSON.stringify(data));
  }

  async processQueue(): Promise<void> {
    const items = await this.getItemsFromQueue();
    if (!items) return;

    for (const item of items) {
      const emailData: EmailQueueData = JSON.parse(item);
      this.eventEmitter.emit('resend.email', new ResendEmailEvent(emailData));
      await this.deleteItemFromQueue(emailData);
    }

    // Clear the queue after processing
    await this.redisService.delete(this.QUEUE_KEY);
  }

  private async getItemsFromQueue(): Promise<string[] | null> {
    return this.redisService.getFromList(this.QUEUE_KEY);
  }

  private async deleteItemFromQueue(queue: EmailQueueData) {
    const test = await this.redisService.removeItemFromList(
      this.QUEUE_KEY,
      1,
      JSON.stringify(queue),
    );

    console.log(test);
  }
}
