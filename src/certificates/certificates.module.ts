import { Module } from '@nestjs/common';
import {
  CertificateFilesController,
  CertificatesController,
} from './controllers';
import { TasksService } from './services';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { CertificatesService, CertificateFilesService } from './services';
import { NotificationModule } from '../notification/notification.module';

@Module({
  controllers: [CertificatesController, CertificateFilesController],
  providers: [CertificatesService, CertificateFilesService, TasksService],
  imports: [PrismaModule, StorageModule, NotificationModule],
})
export class CertificatesModule {}
