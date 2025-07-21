import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResendEmailEvent } from '../../events/resend-email.event';
import { DiscordQueueEvent } from '../../events/discord.events';

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
    if (!items) {
      this.eventEmitter.emit(
        'discord.queue',
        new DiscordQueueEvent(`📭 No items in the email queue. Returning...`),
      );
      return;
    }

    for (const [index, item] of items.entries()) {
      if (index >= 99) {
        const queueLength = await this.getQueueLength();
        this.eventEmitter.emit(
          'discord.queue',
          new DiscordQueueEvent(
            `📕📕📕 Maximum daily queue resend reached. Current queue length: ${queueLength}`,
          ),
        );
        break;
      }

      const emailData: EmailQueueData = JSON.parse(item);
      this.eventEmitter.emit('resend.email', new ResendEmailEvent(emailData));
      await this.deleteItemFromQueue(emailData);

      // There is a rate limit of 1 email per second, so we wait a bit before processing the next one
      await this.sleep(1000);
    }

    this.eventEmitter.emit(
      'discord.queue',
      new DiscordQueueEvent(`✅ Email queue processed successfully.`),
    );
  }

  async getQueueLength(): Promise<number> {
    return this.redisService.getListLength(this.QUEUE_KEY);
  }

  async getItemsFromQueue(start = 0, stop = -1): Promise<string[] | null> {
    return this.redisService.getFromList(this.QUEUE_KEY, start, stop);
  }

  async deleteItemFromQueue(queue: EmailQueueData) {
    return this.redisService.removeItemFromList(
      this.QUEUE_KEY,
      1,
      JSON.stringify(queue),
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
