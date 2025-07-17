import { Controller, ForbiddenException, Get, Headers } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailQueueService } from './email/email-queue.service';
import { EmailCacheService } from './email/email-cache.service';
import axios from 'axios';

@Controller('redis')
export class RedisController {
  private readonly token: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly emailQueueService: EmailQueueService,
    private readonly emailCacheService: EmailCacheService,
  ) {
    this.token = this.configService.getOrThrow('CRON_SECRET');
  }

  @Get('process-email-queue')
  async processEmailQueue(@Headers('authorization') token: string) {
    if (token !== this.token) throw new ForbiddenException();

    await this.sendDiscordMessage(
      '🛠️ Cron job executed: Email queue processing.',
    );

    await this.emailCacheService.resetDailyEmailCount();
    await this.emailQueueService.processQueue();

    await this.sendDiscordMessage(
      '✅ Cron job finished: Queue processing completed.',
    );

    return { success: true };
  }

  private async sendDiscordMessage(content: string): Promise<void> {
    const discordRedriveQueueWebhookUrl = this.configService.getOrThrow(
      'DISCORD_EMPTY_QUEUE_WEBHOOK',
    );

    await axios.post(discordRedriveQueueWebhookUrl, {
      content,
    });
  }
}
