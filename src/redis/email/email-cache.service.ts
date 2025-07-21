import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';
import { EmailQueueData, EmailQueueService } from './email-queue.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DiscordQueueEvent } from '../../events/discord.events';

@Injectable()
export class EmailCacheService {
  private readonly CACHE_KEY = 'emails_sent_today';
  private readonly CACHE_TIMESTAMP_KEY = 'emails_sent_today_timestamp';
  private readonly DAILY_LIMIT = 100;

  constructor(
    private readonly redisService: RedisService,
    private readonly emailQueueService: EmailQueueService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async getCurrentEmailCount(): Promise<number> {
    const cachedCount = await this.redisService.get(this.CACHE_KEY);
    return cachedCount ? parseInt(cachedCount, 10) : 0;
  }

  async validateIfDailyLimitIsHitAndQueueItems(
    data: EmailQueueData,
  ): Promise<boolean> {
    const currentCount = await this.getCurrentEmailCount();
    if (currentCount >= this.DAILY_LIMIT) {
      await this.emailQueueService.enqueueEmail(data);

      const queueLength = await this.emailQueueService.getQueueLength();
      this.eventEmitter.emit(
        'discord.queue',
        new DiscordQueueEvent(
          `📚📚📚 Daily email limit reached! Queued email for later processing. Current queue length: ${queueLength}`,
        ),
      );
      return true;
    }

    return false;
  }

  async resetDailyEmailCount(): Promise<void> {
    await this.redisService.set(this.CACHE_KEY, '0');
    this.eventEmitter.emit(
      'discord.queue',
      new DiscordQueueEvent(`👌 Daily email count reset to 0.`),
    );
  }

  async increaseEmailCount(): Promise<void> {
    const currentCount = await this.getCurrentEmailCount();
    const newCount = currentCount + 1;
    await this.redisService.set(this.CACHE_KEY, newCount.toString());

    if (newCount === 1) {
      await this.setEmailCacheTimestamp();
    }
  }

  async enqueueEmail(data: EmailQueueData): Promise<void> {
    return this.emailQueueService.enqueueEmail(data);
  }

  async getEmailCacheTimestamp(): Promise<string | null> {
    return this.redisService.get(this.CACHE_TIMESTAMP_KEY);
  }

  private async setEmailCacheTimestamp(): Promise<void> {
    const timestamp = new Date().toISOString();
    await this.redisService.set(this.CACHE_TIMESTAMP_KEY, timestamp);
  }
}
