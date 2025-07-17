import { Controller, ForbiddenException, Get, Headers } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailQueueService } from './email/email-queue.service';
import { EmailCacheService } from './email/email-cache.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResendEmailEvent } from '../events/resend-email.event';
import { DiscordQueueEvent } from '../events/discord.events';

@Controller('redis')
export class RedisController {
  private readonly token: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly emailQueueService: EmailQueueService,
    private readonly emailCacheService: EmailCacheService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.token = this.configService.getOrThrow('CRON_SECRET');
  }

  @Get('process-email-queue')
  async processEmailQueue(@Headers('authorization') token: string) {
    if (token !== this.token) throw new ForbiddenException();

    this.emitEvent('🛠️ Cron job executed: Email queue processing.');

    await this.emailCacheService.resetDailyEmailCount();
    await this.emailQueueService.processQueue();

    this.emitEvent('✅ Cron job finished: Queue processing completed.');

    return { success: true };
  }

  private emitEvent(content: string) {
    this.eventEmitter.emit('discord.queue', new DiscordQueueEvent(content));
  }
}
