import { Module } from '@nestjs/common';
import {
  CertificateFilesController,
  CertificatesController,
} from './controllers';
import { TasksService } from './services';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CertificatesService, CertificateFilesService } from './services';

@Module({
  controllers: [CertificatesController, CertificateFilesController],
  providers: [CertificatesService, CertificateFilesService, TasksService],
  imports: [PrismaModule, StorageModule, ScheduleModule.forRoot()],
})
export class CertificatesModule {}
