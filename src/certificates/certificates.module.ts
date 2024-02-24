import { Module } from '@nestjs/common';

import {
  CertificateFilesController,
  CertificatesController,
} from './controllers';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { CertificatesService, CertificateFilesService } from './services';

@Module({
  controllers: [CertificatesController, CertificateFilesController],
  providers: [CertificatesService, CertificateFilesService],
  imports: [PrismaModule, StorageModule],
})
export class CertificatesModule {}
