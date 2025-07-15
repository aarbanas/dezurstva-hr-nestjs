import { Module } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationModule {}
