import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { EmailCacheService } from './email/email-cache.service';
import { EmailQueueService } from './email/email-queue.service';
import { RedisController } from './redis.controller';

@Module({
  providers: [RedisService, EmailCacheService, EmailQueueService],
  exports: [EmailCacheService, EmailQueueService],
  controllers: [RedisController],
})
export class RedisModule {}
