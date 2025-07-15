import { Controller, ForbiddenException, Get, Headers } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailQueueService } from './email/email-queue.service';
import { EmailCacheService } from './email/email-cache.service';

@Controller('redis')
export class RedisController {
  private readonly token: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly emailQueueService: EmailQueueService,
    private readonly emailCacheService: EmailCacheService,
  ) {
    this.token = this.configService.getOrThrow('QUEUE_SECRET');
  }

  @Get('process-email-queue')
  async processEmailQueue(@Headers('x-secret-token') token: string) {
    if (token !== this.token) throw new ForbiddenException();

    await this.emailCacheService.resetDailyEmailCount();
    await this.emailQueueService.processQueue();

    return true;
  }
}
