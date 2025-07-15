import { Module } from '@nestjs/common';
import { ResendEmailListener } from './resend-email.listener';

@Module({
  providers: [ResendEmailListener],
})
export class ListenersModule {}
