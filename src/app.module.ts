import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { CertificatesModule } from './certificates/certificates.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // Add custom validation https://docs.nestjs.com/techniques/configuration#custom-validate-function
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    CertificatesModule,
    AuthModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
