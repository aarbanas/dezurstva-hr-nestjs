import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';
import { EmailQueueData, EmailQueueService } from './email-queue.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DiscordQueueEvent } from '../../events/discord.events';

@Injectable()
export class EmailCacheService {
  private readonly CACHE_KEY = 'emails_sent_today';
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
  }

  async increaseEmailCount(): Promise<void> {
    const currentCount = await this.getCurrentEmailCount();
    const newCount = currentCount + 1;

    await this.redisService.set(this.CACHE_KEY, newCount.toString());
  }

  async enqueueEmail(data: EmailQueueData): Promise<void> {
    return this.emailQueueService.enqueueEmail(data);
  }
}
