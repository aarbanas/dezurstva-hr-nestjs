import { Module } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { RedisModule } from '../redis/redis.module';
import { DiscordService } from './discord/discord.service';

@Module({
  imports: [RedisModule],
  providers: [EmailService, DiscordService],
  exports: [EmailService],
})
export class NotificationModule {}
