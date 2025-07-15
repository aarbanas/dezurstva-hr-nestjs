import { Controller, ForbiddenException, Get, Headers } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailQueueService } from './email/email-queue.service';

@Controller('redis')
export class RedisController {
  private readonly token: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly emailQueueService: EmailQueueService,
  ) {
    this.token = this.configService.getOrThrow('QUEUE_SECRET');
  }

  @Get('process-email-queue')
  async processEmailQueue(@Headers('x-secret-token') token: string) {
    if (token !== this.token) throw new ForbiddenException();

    return this.emailQueueService.processQueue();
  }
}
