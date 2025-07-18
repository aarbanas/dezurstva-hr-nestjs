import { Module } from '@nestjs/common';
import { ResendEmailListener } from './resend-email.listener';
import { NotificationModule } from '../notification/notification.module';
import { DiscordListener } from './discord.listener';

@Module({
  imports: [NotificationModule],
  providers: [ResendEmailListener, DiscordListener],
  exports: [ResendEmailListener, DiscordListener],
})
export class ListenersModule {}
