import { Module } from '@nestjs/common';
import { ResendEmailListener } from './resend-email.listener';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [ResendEmailListener],
})
export class ListenersModule {}
