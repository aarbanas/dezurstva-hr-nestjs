import { Module } from '@nestjs/common';

import { UsersService } from './users.service';
import { S3Service } from '../storage/s3.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BcryptService } from '../service/bcrypt.service';
import { UsersRepository } from './repository/users.repository';
import { NotificationModule } from '../notification/notification.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService, BcryptService, S3Service, UsersRepository],
  imports: [PrismaModule, NotificationModule],
  exports: [UsersService],
})
export class UsersModule {}
