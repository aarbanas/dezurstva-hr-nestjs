import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../redis/redis.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ListenersModule } from '../listeners/listeners.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    NotificationModule,
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ListenersModule,
  ],
})
export class ApplicationModule {}
