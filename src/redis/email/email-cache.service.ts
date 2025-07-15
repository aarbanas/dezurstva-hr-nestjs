import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';
import { EmailQueueData, EmailQueueService } from './email-queue.service';

@Injectable()
export class EmailCacheService {
  private readonly CACHE_KEY = 'emails_sent_today';
  private readonly DAILY_LIMIT = 100;

  constructor(
    private readonly redisService: RedisService,
    private emailQueueService: EmailQueueService,
  ) {}

  private async getCurrentEmailCount(): Promise<number> {
    const cachedCount = await this.redisService.get(this.CACHE_KEY);
    return cachedCount ? parseInt(cachedCount, 10) : 0;
  }

  async isDailyEmailLimitFull(data: EmailQueueData): Promise<boolean> {
    const currentCount = await this.getCurrentEmailCount();
    if (currentCount >= this.DAILY_LIMIT) {
      await this.emailQueueService.enqueueEmail(data);
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
}
