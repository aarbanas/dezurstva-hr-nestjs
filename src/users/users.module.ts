import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BcryptService } from '../service/bcrypt.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, BcryptService],
  imports: [PrismaModule],
})
export class UsersModule {}
